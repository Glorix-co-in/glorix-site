// Global site config: single source of truth for booking-open state and event start.
// Data lives in data/events.json so all gating logic stays in sync from one place.
window.GLORIX_CONFIG = (function () {
  // Keep the Netlify dev preview public for anyone opening its shared link.
  // Production and other hosts continue to follow bookingOpensAtISO.
  const TEST_OVERRIDE_HOST = "dev--glorix-new.netlify.app";
  const TEST_OVERRIDE_KEY = "glorix_booking_override";
  const canUseLocalOverride = window.location.hostname === TEST_OVERRIDE_HOST;
  if (canUseLocalOverride) {
    try {
      window.localStorage.setItem(TEST_OVERRIDE_KEY, "public");
    } catch {
      // The timestamp still controls visibility if storage is unavailable.
    }
  }
  const params = new URLSearchParams(window.location.search);
  const forceOpen = canUseLocalOverride &&
    (params.get("bookingopen") === "1" || params.get("bookingopen") === "true");

  let bookingOpensAtISO = null;
  let eventStartsAtISO = null;
  const eventsById = new Map();
  let campaigns = [];
  let campaignTimer;
  let activeCampaignKey = "";
  let readyResolve;
  const ready = new Promise((resolve) => {
    readyResolve = resolve;
  });

  function getBookingOverride() {
    if (!canUseLocalOverride) return "auto";
    try {
      const value = window.localStorage.getItem(TEST_OVERRIDE_KEY);
      return value === "public" || value === "private" ? value : "auto";
    } catch {
      return "auto";
    }
  }

  async function loadJson(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Failed to load ${path}`);
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  Promise.all([loadJson("data/events.json"), loadJson("data/campaigns.json")])
    .then(([events, campaignData]) => {
      campaigns = Array.isArray(campaignData) ? campaignData : [];
      if (!Array.isArray(events)) return;
      events.forEach((event) => eventsById.set(event.id, event));
      const activeStatuses = new Set([
        "open",
        "available",
        "filling-fast",
        "sold-out",
        "soon",
      ]);
      const now = Date.now();
      const candidates = events
        .filter((event) => {
          if (
            !event.details ||
            event.hiddenFromBookings === true ||
            event.status === "hidden" ||
            !activeStatuses.has(event.status)
          ) {
            return false;
          }

          const eventStart = event.details.eventStartsAtISO
            ? new Date(event.details.eventStartsAtISO).getTime()
            : null;
          const hasValidStart = Number.isFinite(eventStart);
          const hasBookingDate = Boolean(event.details.bookingOpensAtISO);

          return (hasValidStart || hasBookingDate) &&
            (!hasValidStart || eventStart > now);
        })
        .sort((a, b) => {
          const aBookingOrder = Number.isFinite(a.bookingOrder)
            ? a.bookingOrder
            : Infinity;
          const bBookingOrder = Number.isFinite(b.bookingOrder)
            ? b.bookingOrder
            : Infinity;
          if (aBookingOrder !== bBookingOrder) {
            return aBookingOrder - bBookingOrder;
          }

          if (Boolean(a.isFeatured) !== Boolean(b.isFeatured)) {
            return a.isFeatured ? -1 : 1;
          }

          const getRelevantDate = (event) => {
            const value =
              event.details.eventStartsAtISO ||
              event.details.bookingOpensAtISO;
            const timestamp = new Date(value).getTime();
            return Number.isFinite(timestamp) ? timestamp : Infinity;
          };

          return getRelevantDate(a) - getRelevantDate(b);
        });
      const featured = candidates[0] || null;

      if (featured?.details?.bookingOpensAtISO) {
        bookingOpensAtISO = featured.details.bookingOpensAtISO;
      }
      if (featured?.details?.eventStartsAtISO) {
        eventStartsAtISO = featured.details.eventStartsAtISO;
      }
    })
    .catch(() => {})
    .finally(() => {
      activeCampaignKey = getActiveCampaigns().map((campaign) => campaign.id).join("|");
      readyResolve();
      watchCampaigns();
    });

  function getActiveCampaigns(now = Date.now()) {
    return campaigns.filter((campaign) => {
      const start = Date.parse(campaign.startsAt);
      const end = Date.parse(campaign.endsAt);
      return campaign.enabled === true && Number.isFinite(start) &&
        Number.isFinite(end) && start < end && start <= now && now < end;
    });
  }

  // First matching config entry wins when campaign windows overlap.
  function getActiveCampaignFor(eventId, now = Date.now()) {
    return getActiveCampaigns(now).find((campaign) =>
      campaign.eventIds?.includes(eventId),
    ) || null;
  }

  function getEvent(eventId, now = Date.now()) {
    const base = eventsById.get(eventId);
    if (!base) return null;
    const event = structuredClone(base);
    const price = getActiveCampaignFor(eventId, now)?.effects?.priceFrom;
    if (Number.isFinite(price) && price >= 0) {
      event.details = { ...event.details, priceFrom: price };
    }
    return event;
  }

  function getEvents(now = Date.now()) {
    return Array.from(eventsById.keys(), (id) => getEvent(id, now));
  }

  function getHomeSlides(baseSlides, now = Date.now()) {
    const first = [];
    const last = [];
    getActiveCampaigns(now).forEach((campaign) => {
      const slide = campaign.effects?.homeCarousel;
      if (!slide || !campaign.eventIds?.includes(slide.eventId)) return;
      (slide.position === "last" ? last : first).push({ ...slide });
    });
    return [...first, ...baseSlides, ...last];
  }

  function getHomePopup(eventId, now = Date.now()) {
    const campaign = getActiveCampaigns(now).find((item) =>
      item.eventIds?.includes(eventId) && item.effects?.homePopup?.eventId === eventId,
    );
    return campaign ? { ...campaign.effects.homePopup, campaignId: campaign.id } : null;
  }

  function watchCampaigns() {
    clearTimeout(campaignTimer);
    const now = Date.now();
    const key = getActiveCampaigns(now).map((campaign) => campaign.id).join("|");
    if (key !== activeCampaignKey) {
      activeCampaignKey = key;
      document.dispatchEvent(new Event("campaign-changed"));
    }
    const boundaries = campaigns.filter((campaign) => campaign.enabled === true)
      .flatMap((campaign) => [Date.parse(campaign.startsAt), Date.parse(campaign.endsAt)])
      .filter((time) => Number.isFinite(time) && time > now);
    // Recheck clock changes as well as scheduling the exact next boundary.
    const delay = boundaries.length ? Math.min(60000, Math.min(...boundaries) - now) : 60000;
    campaignTimer = setTimeout(watchCampaigns, Math.max(1, delay));
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) ready.then(watchCampaigns);
  });
  window.addEventListener("pageshow", () => ready.then(watchCampaigns));
  window.addEventListener("focus", () => ready.then(watchCampaigns));

  function isBookingOpen() {
    const override = getBookingOverride();
    if (override === "private") return false;
    if (override === "public" || forceOpen) return true;
    if (!bookingOpensAtISO) return false;
    return Date.now() >= new Date(bookingOpensAtISO).getTime();
  }

  function hasEventStarted() {
    if (!eventStartsAtISO) return false;
    return Date.now() >= new Date(eventStartsAtISO).getTime();
  }

  function hasBookingEndedFor(eventId) {
    const eventEndAt = eventsById.get(eventId)?.details?.bookingEndsAtISO;
    if (!eventEndAt) return false;
    const timestamp = new Date(eventEndAt).getTime();
    return Number.isFinite(timestamp) && Date.now() >= timestamp;
  }

  function isBookingOpenFor(eventId) {
    if (hasBookingEndedFor(eventId)) return false;
    return hasBookingOpenedFor(eventId);
  }

  function hasBookingOpenedFor(eventId) {
    const override = getBookingOverride();
    if (override === "private") return false;
    if (override === "public" || forceOpen) return true;
    const eventOpenAt = eventsById.get(eventId)?.details?.bookingOpensAtISO;
    if (!eventOpenAt) return true;
    const timestamp = new Date(eventOpenAt).getTime();
    return Number.isFinite(timestamp) && Date.now() >= timestamp;
  }

  function getBookingOpensAtISOFor(eventId) {
    return eventsById.get(eventId)?.details?.bookingOpensAtISO || null;
  }

  return {
    forceOpen,
    canUseLocalOverride,
    testOverrideKey: TEST_OVERRIDE_KEY,
    getBookingOverride,
    ready,
    getEvent,
    getEvents,
    getActiveCampaignFor,
    getHomeSlides,
    getHomePopup,
    isBookingOpen,
    getBookingOpensAtISO: () => bookingOpensAtISO,
    isBookingOpenFor,
    hasBookingOpenedFor,
    hasBookingEndedFor,
    getBookingOpensAtISOFor,
    hasEventStarted,
    getEventStartsAtISO: () => eventStartsAtISO,
  };
})();
