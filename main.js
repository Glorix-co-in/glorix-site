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
    const sliderWrapper = document.querySelector(".review-slider-wrapper");

    if (!reviewSlides || !dotsContainer || !sliderWrapper) return;

    let currentPage = 0;
    let isProgrammaticScroll = false;
    let autoScrollInterval;

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
      const scrollAmount = currentPage * sliderWrapper.clientWidth;

      isProgrammaticScroll = true;
      sliderWrapper.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });

      // Update dots active state
      const dots = dotsContainer.querySelectorAll(".dot");
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === currentPage);
      });

      // Reset programmatic flag after animation
      setTimeout(() => {
        isProgrammaticScroll = false;
      }, 800);
    }

    function goToPage(pageIndex) {
      const totalPages = getTotalPages();
      currentPage = ((pageIndex % totalPages) + totalPages) % totalPages;
      updateSlider();
    }

    // Manual scroll detection
    sliderWrapper.addEventListener("scroll", () => {
      if (isProgrammaticScroll) return;

      const newPage = Math.round(
        sliderWrapper.scrollLeft / sliderWrapper.clientWidth
      );

      if (newPage !== currentPage) {
        currentPage = newPage;
        const dots = dotsContainer.querySelectorAll(".dot");
        dots.forEach((dot, i) => {
          dot.classList.toggle("active", i === currentPage);
        });
      }
    });

    // Initial setup
    createDots();

    // Auto-advance
    function startAutoScroll() {
      autoScrollInterval = setInterval(() => {
        goToPage(currentPage + 1);
      }, 4000);
    }

    startAutoScroll();

    // Pause auto-scroll on user interaction
    sliderWrapper.addEventListener("touchstart", () => {
      clearInterval(autoScrollInterval);
    });

    sliderWrapper.addEventListener("mousedown", () => {
      clearInterval(autoScrollInterval);
    });

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
    const seeAllBtn = document.querySelector(".see-all-btn");

    fetch("data/artists.json")
      .then((response) => response.json())
      .then((artists) => {
        function renderArtists() {
          artistsGrid.innerHTML = "";
          let limit = null;

          if (seeAllBtn) {
            if (window.innerWidth <= 768) {
              limit = 8;
            } else {
              // Let the browser calculate the columns first, then count them
              // We temporarily add one item to ensure the grid layout is computed
              const temp = document.createElement("div");
              temp.style.visibility = "hidden";
              artistsGrid.appendChild(temp);

              const style = window.getComputedStyle(artistsGrid);
              const gridCols = style
                .getPropertyValue("grid-template-columns")
                .split(" ").length;
              artistsGrid.removeChild(temp);

              limit = Math.max(gridCols * 2, 4); // Show at least 2 rows, minimum 4 items
            }
          }

          const artistsToShow = limit ? artists.slice(0, limit) : artists;
          artistsToShow.forEach((artist) => {
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
        }

        renderArtists();

        if (seeAllBtn) {
          let resizeTimeout;
          window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(renderArtists, 200);
          });
        }
      })
      .catch((error) => console.error("Error loading artists:", error));
  }

  // ===== GSAP Animations =====
  if (typeof gsap !== "undefined") {
    const plugins = [];
    if (typeof ScrollTrigger !== "undefined") plugins.push(ScrollTrigger);
    if (typeof Flip !== "undefined") plugins.push(Flip);

    if (plugins.length > 0) {
      gsap.registerPlugin(...plugins);
    }

    // Set initial states for elements that will animate in
    gsap.set(".navbar .logo", { y: -30 });
    gsap.set(".nav-center ul li", { y: -20 });
    gsap.set(".call-btn", { x: 30 });
    gsap.set(".section-title", { y: 40 });

    const gridElements = [
      ".review-slider-wrapper",
      ".gallery-grid",
      ".artists-grid",
      ".team-grid",
      ".marquee",
    ];
    gridElements.forEach((selector) => {
      if (document.querySelector(selector)) {
        gsap.set(selector, { y: 50 });
      }
    });

    if (document.querySelector(".contact-container")) {
      gsap.set(".contact-container > *", { y: 30 });
    }

    // Header Animations (on load)
    const headerTl = gsap.timeline();
    headerTl
      .to(".navbar .logo", {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      })
      .to(
        ".nav-center ul li",
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out",
        },
        "-=0.3"
      )
      .to(
        ".call-btn",
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.3,
          ease: "power2.out",
        },
        "-=0.2"
      );

    // Hero Carousel Animation
    if (document.querySelector(".carousel-wrapper")) {
      gsap.to(".carousel-wrapper", {
        autoAlpha: 1,
        duration: 0.6,
        delay: 0.2,
        ease: "power1.inOut",
      });
    }

    // Section Titles
    const sectionTitles = gsap.utils.toArray(".section-title");
    sectionTitles.forEach((title) => {
      gsap.to(title, {
        scrollTrigger: {
          trigger: title,
          start: "top 90%",
          once: true,
        },
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    });

    // About Content - Simplified and robust entry
    const aboutMain = document.querySelector(".about-main-card");
    const statCards = gsap.utils.toArray(".stat-card");

    if (aboutMain) {
      const aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#about",
          start: "top 75%",
          once: true,
        },
      });

      aboutTl
        .to(aboutMain, {
          autoAlpha: 1,
          x: 0,
          duration: 0.8,
          ease: "power2.out",
          onStart: () => gsap.set(aboutMain, { x: -40 }), // Ensure start position
        })
        .to(
          statCards,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.2)",
            onStart: () => gsap.set(statCards, { y: 30, scale: 0.9 }), // Ensure start position
          },
          "-=0.4"
        );
    }

    // Testimonials Content
    if (
      document.querySelector("#testimonials") &&
      document.querySelector(".review-slider-wrapper")
    ) {
      gsap.to(".review-slider-wrapper", {
        scrollTrigger: {
          trigger: "#testimonials",
          start: "top 75%",
          once: true,
        },
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    }

    // Artists Grid
    if (
      document.querySelector("#artists") &&
      document.querySelector(".artists-grid")
    ) {
      gsap.to(".artists-grid", {
        scrollTrigger: {
          trigger: "#artists",
          start: "top 75%",
          once: true,
        },
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    }

    // Team Grid
    if (
      document.querySelector("#team") &&
      document.querySelector(".team-grid")
    ) {
      gsap.to(".team-grid", {
        scrollTrigger: {
          trigger: "#team",
          start: "top 75%",
          once: true,
        },
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    }

    // Collaboration Section
    const marquee = document.querySelector(".marquee");
    if (marquee) {
      gsap.to(marquee, {
        scrollTrigger: {
          trigger: ".collaboration-section",
          start: "top 75%",
          once: true,
        },
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    }

    // Gallery Grid
    const galleryGrid = document.querySelector(".gallery-grid");
    if (galleryGrid) {
      gsap.to(galleryGrid, {
        scrollTrigger: {
          trigger: galleryGrid,
          start: "top 90%",
          once: true,
        },
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    }
    // Contact Content
    if (
      document.querySelector("#contact") &&
      document.querySelector(".contact-container")
    ) {
      gsap.to(".contact-container > *", {
        scrollTrigger: {
          trigger: "#contact",
          start: "top 75%",
          once: true,
        },
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
  }
});
