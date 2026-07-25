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
      const event = events.find(
        (e) => e.details && e.details.bookingOpensAtISO,
      );
      if (event) bookingOpensAtISO = event.details.bookingOpensAtISO;
      const eventStart = events.find(
        (e) => e.details && e.details.eventStartsAtISO,
      );
      if (eventStart) eventStartsAtISO = eventStart.details.eventStartsAtISO;
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
