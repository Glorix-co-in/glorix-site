window.GlorixCarousel = {
  init: function (track, duration = 3000) {
    if (!track) return null;

    track.style.transform = "translateX(0)";
    track.style.transition = "transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)";

    const slides = Array.from(track.querySelectorAll(".carousel-slide"));
    if (slides.length <= 1) return null;

    const firstClone = slides[0].cloneNode(true);
    track.appendChild(firstClone);

    const totalSlides = slides.length;
    let currentSlide = 0;
    let isTransitioning = false;

    const container = track.parentElement;
    let dotsContainer = container.querySelector(".carousel-dots");
    if (dotsContainer) dotsContainer.remove();
    dotsContainer = document.createElement("div");
    dotsContainer.className = "carousel-dots";
    container.appendChild(dotsContainer);

    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement("button");
      dot.className = "carousel-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      dot.addEventListener("click", () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }

    function updateDots() {
      const dots = dotsContainer.querySelectorAll(".carousel-dot");
      dots.forEach((d, i) => d.classList.toggle("active", i === currentSlide));
    }

    function goToSlide(index) {
      if (isTransitioning || index === currentSlide) return;
      isTransitioning = true;
      currentSlide = index;
      track.style.transition = "transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)";
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      updateDots();
      setTimeout(() => { isTransitioning = false; }, 600);
    }

    function advanceSlide() {
      if (isTransitioning) return;
      isTransitioning = true;
      currentSlide++;

      track.style.transition = "transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)";
      track.style.transform = `translateX(-${currentSlide * 100}%)`;

      if (currentSlide === totalSlides) {
        setTimeout(() => {
          track.style.transition = "none";
          currentSlide = 0;
          track.style.transform = "translateX(0)";
          track.offsetHeight;
          updateDots();
          isTransitioning = false;
        }, 600);
      } else {
        updateDots();
        setTimeout(() => { isTransitioning = false; }, 600);
      }
    }

    function prevSlide() {
      if (isTransitioning) return;
      isTransitioning = true;

      if (currentSlide === 0) {
        track.style.transition = "none";
        currentSlide = totalSlides;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        track.offsetHeight;
        currentSlide--;
        track.style.transition = "transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)";
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        updateDots();
        setTimeout(() => { isTransitioning = false; }, 600);
      } else {
        currentSlide--;
        track.style.transition = "transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)";
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        updateDots();
        setTimeout(() => { isTransitioning = false; }, 600);
      }
    }

    const interval = setInterval(advanceSlide, duration);

    let startX = 0;
    let startY = 0;
    let isDragging = false;

    track.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
    }, { passive: true });

    track.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
    }, { passive: false });

    track.addEventListener("touchend", (e) => {
      if (!isDragging) return;
      isDragging = false;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) advanceSlide();
        else prevSlide();
      }
    }, { passive: true });

    return interval;
  },
};
