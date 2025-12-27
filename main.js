document.addEventListener("DOMContentLoaded", function () {
  // ===== Carousel =====
  const carouselTrack = document.getElementById("carouselTrack");
  const carouselTemplate = document.getElementById("carouselTemplate");

  if (carouselTrack && carouselTemplate) {
    fetch("data/carousel.json")
      .then((response) => response.json())
      .then((slidesData) => {
        slidesData.forEach((slide) => {
          const clone = carouselTemplate.content.cloneNode(true);
          const img = clone.querySelector("img");
          img.src = slide.image;
          img.alt = slide.alt;
          carouselTrack.appendChild(clone);
        });
        initCarousel();
      })
      .catch((error) => console.error("Error loading carousel:", error));
  }

  function initCarousel() {
    const track = document.getElementById("carouselTrack");
    const slides = Array.from(track.querySelectorAll(".carousel-slide"));
    if (slides.length > 0) {
      let currentSlide = 0;
      const slideDuration = 3000;

      function moveToSlide(index) {
        currentSlide = (index + slides.length) % slides.length;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
      }

      setInterval(() => {
        moveToSlide(currentSlide + 1);
      }, slideDuration);
    }
  }

  // ===== Testimonials Slider =====
  const testimonialSlides = document.getElementById("testimonialSlides");
  const testimonialDots = document.getElementById("testimonialDots");
  const testimonialTemplate = document.getElementById("testimonialTemplate");

  if (testimonialSlides && testimonialDots && testimonialTemplate) {
    fetch("data/testimonials.json")
      .then((response) => response.json())
      .then((testimonials) => {
        // Store testimonials count for dot calculation
        const totalTestimonials = testimonials.length;

        testimonials.forEach((testimonial) => {
          // Create Slide
          const clone = testimonialTemplate.content.cloneNode(true);
          clone.querySelector(".reviewer-img").src = testimonial.image;
          clone.querySelector(".reviewer-img").alt = testimonial.name;
          clone.querySelector(
            ".review-text"
          ).textContent = `"${testimonial.text}"`;
          clone.querySelector(".reviewer-name").textContent = testimonial.name;
          clone.querySelector(".reviewer-role").textContent = testimonial.role;
          testimonialSlides.appendChild(clone);
        });

        initTestimonialSlider(totalTestimonials);
      })
      .catch((error) => console.error("Error loading testimonials:", error));
  }

  function initTestimonialSlider(totalTestimonials) {
    const reviewSlides = document.getElementById("testimonialSlides");
    const dotsContainer = document.getElementById("testimonialDots");

    if (!reviewSlides || !dotsContainer) return;

    let currentPage = 0;

    function getItemsPerPage() {
      return window.innerWidth <= 768 ? 1 : 2;
    }

    function getTotalPages() {
      return Math.ceil(totalTestimonials / getItemsPerPage());
    }

    function createDots() {
      dotsContainer.innerHTML = "";
      const totalPages = getTotalPages();

      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        if (i === currentPage) dot.classList.add("active");
        dot.addEventListener("click", () => goToPage(i));
        dotsContainer.appendChild(dot);
      }
    }

    function updateSlider() {
      const itemsPerPage = getItemsPerPage();
      // Each item is 50% on desktop (2 per view) or 100% on mobile (1 per view)
      const slidePercent = itemsPerPage === 1 ? 100 : 50;
      const transformPercent = currentPage * itemsPerPage * slidePercent;
      reviewSlides.style.transform = `translateX(-${transformPercent}%)`;

      // Update dots active state
      const dots = dotsContainer.querySelectorAll(".dot");
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === currentPage);
      });
    }

    function goToPage(pageIndex) {
      const totalPages = getTotalPages();
      currentPage = ((pageIndex % totalPages) + totalPages) % totalPages;
      updateSlider();
    }

    // Initial setup
    createDots();
    updateSlider();

    // Auto-advance
    setInterval(() => {
      goToPage(currentPage + 1);
    }, 4000);

    // Handle resize - recreate dots and adjust position
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const totalPages = getTotalPages();
        if (currentPage >= totalPages) {
          currentPage = 0;
        }
        createDots();
        updateSlider();
      }, 150);
    });
  }

  // ===== Load Artists Dynamically =====
  const artistsGrid = document.getElementById("artistsGrid");
  const artistTemplate = document.getElementById("artistTemplate");

  if (artistsGrid && artistTemplate) {
    fetch("data/artists.json")
      .then((response) => response.json())
      .then((artists) => {
        artists.forEach((artist) => {
          const clone = artistTemplate.content.cloneNode(true);
          const card = clone.querySelector(".artist-card");
          const img = clone.querySelector("img");
          const name = clone.querySelector("h3");

          card.href = artist.link || "#";
          img.src = artist.image;
          img.alt = artist.name;
          name.textContent = artist.name;

          artistsGrid.appendChild(clone);
        });
      })
      .catch((error) => console.error("Error loading artists:", error));
  }
});
