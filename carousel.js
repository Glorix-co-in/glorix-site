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
    track.style.transition = "transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)";

    const slides = Array.from(track.querySelectorAll(".carousel-slide"));
    if (slides.length <= 1) return null;

    // Clone the first slide and append it to the track for a seamless loop
    const firstClone = slides[0].cloneNode(true);
    track.appendChild(firstClone);

    const totalSlidesWithClone = slides.length + 1;
    let currentSlide = 0;

    const interval = setInterval(() => {
      currentSlide++;

      // Move to the next slide (including the clone)
      track.style.transition = "transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)";
      track.style.transform = `translateX(-${currentSlide * 100}%)`;

      // If we are at the clone, teleport back to the first slide after the transition
      if (currentSlide === slides.length) {
        setTimeout(() => {
          track.style.transition = "none";
          currentSlide = 0;
          track.style.transform = "translateX(0)";
          // Force a reflow before re-enabling transition for next time
          track.offsetHeight;
        }, 600); // This delay should match the transition duration
      }
    }, duration);

    return interval;
  },
};
