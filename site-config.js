// Global site config: single source of truth for the "bookings open" state.
// The booking-open date lives in data/events.json (glory-26.details.bookingOpensAtISO)
// so all gating logic (popup, details page, carousel) stays in sync from one place.
window.GLORIX_CONFIG = (function () {
  const params = new URLSearchParams(window.location.search);
  const forceOpen =
    params.get("bookingopen") === "1" || params.get("bookingopen") === "true";

  let bookingOpensAtISO = null;
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
    })
    .catch(() => {})
    .finally(() => readyResolve());

  function isBookingOpen() {
    if (forceOpen) return true;
    if (!bookingOpensAtISO) return false;
    return Date.now() >= new Date(bookingOpensAtISO).getTime();
  }

  return {
    forceOpen,
    ready,
    isBookingOpen,
    getBookingOpensAtISO: () => bookingOpensAtISO,
  };
})();
