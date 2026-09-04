// Global site config: single source of truth for booking-open state and event start.
// Data lives in data/events.json so all gating logic stays in sync from one place.
window.GLORIX_CONFIG = (function () {
  const params = new URLSearchParams(window.location.search);
  const forceOpen =
    params.get("bookingopen") === "1" || params.get("bookingopen") === "true";

  let bookingOpensAtISO = null;
  let eventStartsAtISO = null;
  let readyResolve;
  const ready = new Promise((resolve) => {
    readyResolve = resolve;
  });

  fetch("data/events.json")
    .then((response) => response.json())
    .then((events) => {
      if (!Array.isArray(events)) return;
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
    if (forceOpen) return true;
    if (!bookingOpensAtISO) return false;
    return Date.now() >= new Date(bookingOpensAtISO).getTime();
  }

  function hasEventStarted() {
    if (!eventStartsAtISO) return false;
    return Date.now() >= new Date(eventStartsAtISO).getTime();
  }

  return {
    forceOpen,
    ready,
    isBookingOpen,
    getBookingOpensAtISO: () => bookingOpensAtISO,
    hasEventStarted,
    getEventStartsAtISO: () => eventStartsAtISO,
  };
})();
