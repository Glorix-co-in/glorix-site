/**
 * GLORIX Carousel Engine
 * A simple, reusable horizontal slider for hero banners and media tracks.
 */

window.GlorixCarousel = {
  /**
   * Initializes a carousel on a given track element.
   * @param {HTMLElement} track - The element containing .carousel-slide items.
   * @param {number} duration - Time in milliseconds between transitions.
   * @returns {number|null} - The interval ID or null if not applicable.
   */
  init: function (track, duration = 3000) {
    if (!track) return null;

    // Reset position
    track.style.transform = "translateX(0)";

    const slides = Array.from(track.querySelectorAll(".carousel-slide"));
    if (slides.length <= 1) return null;

    let currentSlide = 0;

    const interval = setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }, duration);

    return interval;
  },
};
