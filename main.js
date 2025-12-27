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
        testimonials.forEach((testimonial, index) => {
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

          // Create Dot
          const dot = document.createElement("span");
          dot.classList.add("dot");
          if (index === 0) dot.classList.add("active");
          testimonialDots.appendChild(dot);
        });
        initTestimonialSlider();
      })
      .catch((error) => console.error("Error loading testimonials:", error));
  }

  function initTestimonialSlider() {
    const reviewSlides = document.getElementById("testimonialSlides");
    const dots = document.querySelectorAll("#testimonialDots .dot");
    if (reviewSlides && dots.length > 0) {
      let currentReview = 0;
      let isMobile = window.innerWidth <= 768;
      let totalPages = isMobile ? dots.length : Math.ceil(dots.length / 2);

      function updateReviewSlider(index) {
        currentReview = index;
        const transformPercent = currentReview * 100;
        reviewSlides.style.transform = `translateX(-${transformPercent}%)`;

        dots.forEach((dot, i) => {
          dot.classList.toggle("active", i === currentReview);
        });
      }

      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => updateReviewSlider(i));
      });

      setInterval(() => {
        let next = (currentReview + 1) % totalPages;
        updateReviewSlider(next);
      }, 4000);

      window.addEventListener("resize", () => {
        isMobile = window.innerWidth <= 768;
        totalPages = isMobile ? dots.length : Math.ceil(dots.length / 2);
        if (currentReview >= totalPages) updateReviewSlider(0);
      });
    }
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
