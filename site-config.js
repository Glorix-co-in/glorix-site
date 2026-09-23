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

  fetch("data/events.json")
    .then((response) => response.json())
    .then((events) => {
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
    .finally(() => readyResolve());

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

  function isBookingOpenFor(eventId) {
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
    isBookingOpen,
    getBookingOpensAtISO: () => bookingOpensAtISO,
    isBookingOpenFor,
    getBookingOpensAtISOFor,
    hasEventStarted,
    getEventStartsAtISO: () => eventStartsAtISO,
  };
})();
