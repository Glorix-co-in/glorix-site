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
      // Featured event = the one with the latest start (the current upcoming event).
      let featured = null;
      events.forEach((e) => {
        if (!e.details) return;
        const start = e.details.eventStartsAtISO
          ? new Date(e.details.eventStartsAtISO).getTime()
          : -Infinity;
        const currentBest = featured?.details?.eventStartsAtISO
          ? new Date(featured.details.eventStartsAtISO).getTime()
          : -Infinity;
        if (start > currentBest) featured = e;
      });
      if (!featured) {
        featured = events.find(
          (e) => e.details && e.details.bookingOpensAtISO,
        );
      }
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
