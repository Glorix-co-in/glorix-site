document.addEventListener("DOMContentLoaded", function () {
  let carouselInterval;
  // ===== Carousel =====
  const carouselTrack = document.getElementById("carouselTrack");
  const carouselTemplate = document.getElementById("carouselTemplate");

  const originalYoutubeWrapper = document.getElementById("youtube-original");

  if (carouselTrack && carouselTemplate) {
    fetch("data/carousel.json")
      .then((response) => response.json())
      .then((slidesData) => {
        // make sure slidesData is always an array
        if (!Array.isArray(slidesData)) {
          slidesData = [];
        }

        const hasCarouselSlides = slidesData.length > 0;

        if (hasCarouselSlides) {
          if (originalYoutubeWrapper) {
            originalYoutubeWrapper.style.display = "flex";
          }
        } else {
          if (originalYoutubeWrapper) {
            originalYoutubeWrapper.style.display = "none";
          }
          slidesData.unshift({
            youtube: "https://www.youtube.com/embed/agFeZEmPKL4",
            alt: "GLORIX Promo Video",
          });
        }

        function getVisibleSlides() {
          const opened = window.GLORIX_CONFIG.isBookingOpen();
          return slidesData.filter((slide) => {
            if (slide.hideWhenBookingOpen && opened) return false;
            if (slide.showWhenBookingOpen && !opened) return false;
            return true;
          });
        }

        function renderCarousel() {
          carouselTrack.innerHTML = "";
          const isMobile = window.innerWidth <= 768;

          getVisibleSlides().forEach((slide) => {
            const clone = carouselTemplate.content.cloneNode(true);

            // handle YouTube embed specially
            if (slide.youtube) {
              // hide other media elements
              const mainImg = clone.querySelector(".main-img");
              const bgImg = clone.querySelector(".bg-img");
              const mainVideo = clone.querySelector(".main-video");
              const bgVideo = clone.querySelector(".bg-video");
              const ytContainer = clone.querySelector(".youtube-container");
              const ytIframe =
                ytContainer && ytContainer.querySelector("iframe");

              if (mainImg) mainImg.style.display = "none";
              if (bgImg) bgImg.style.display = "none";
              if (mainVideo) mainVideo.style.display = "none";
              if (bgVideo) bgVideo.style.display = "none";

              if (ytContainer && ytIframe) {
                ytContainer.style.display = "block";
                ytIframe.src = slide.youtube;
                ytIframe.title = slide.alt || "YouTube video";
              }
            } else {
              const isVideo = !!(
                slide.desktopVideo ||
                slide.mobileVideo ||
                slide.video
              );

              if (isVideo) {
                const mainImg = clone.querySelector(".main-img");
                const bgImg = clone.querySelector(".bg-img");
                const mainVideo = clone.querySelector(".main-video");
                const bgVideo = clone.querySelector(".bg-video");

                if (mainImg) mainImg.style.display = "none";
                if (bgImg) bgImg.style.display = "none";

                const videoSrc = isMobile
                  ? slide.mobileVideo || slide.video
                  : slide.desktopVideo || slide.video;

                if (mainVideo) {
                  mainVideo.src = videoSrc;
                  mainVideo.style.display = "block";
                }
                if (bgVideo) {
                  bgVideo.src = videoSrc;
                  bgVideo.style.display = "block";
                }
              } else {
                const images = clone.querySelectorAll("img");
                const imgSrc = isMobile
                  ? slide.mobileImage
                  : slide.desktopImage;

                images.forEach((img) => {
                  img.src = imgSrc;
                  img.alt = slide.alt || "Carousel Image";
                });
              }
            }
            carouselTrack.appendChild(clone);
          });
          if (carouselInterval) clearInterval(carouselInterval);
          carouselInterval = GlorixCarousel.init(carouselTrack, 3000);
        }

        // Wait for the global booking-open date to load, then render.
        // (isBookingOpen() is safe before that, but this guarantees correct gating.)
        window.GLORIX_CONFIG.ready.then(renderCarousel);

        // Live re-render when bookings open (no page reload needed)
        document.addEventListener("booking-opened", () => renderCarousel());

        // Re-render on resize to switch images if needed
        let resizeTimeout;
        window.addEventListener("resize", () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(renderCarousel, 250);
        });
      })
      .catch((error) => console.error("Error loading carousel:", error));
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
          clone.querySelector(".review-text").textContent =
            `"${testimonial.text}"`;
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
        sliderWrapper.scrollLeft / sliderWrapper.clientWidth,
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
    sliderWrapper.addEventListener(
      "touchstart",
      () => {
        clearInterval(autoScrollInterval);
      },
      { passive: true },
    );

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
        // exclude entries marked hidden (e.g. Saksham)
        const visibleArtists = artists.filter((a) => !a.hidden);

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

          const artistsToShow = limit
            ? visibleArtists.slice(0, limit)
            : visibleArtists;
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

  // ===== Load Team Dynamically =====
  const teamGrid = document.getElementById("teamGrid");
  const teamTemplate = document.getElementById("teamTemplate");

  if (teamGrid && teamTemplate) {
    fetch("data/teams.json")
      .then((response) => response.json())
      .then((teams) => {
        teams.forEach((member) => {
          const clone = teamTemplate.content.cloneNode(true);
          const card = clone.querySelector(".artist-card");
          const img = clone.querySelector("img");
          const name = clone.querySelector("h3");

          card.href = member.link || "#";
          img.src = member.image;
          img.alt = member.role;
          name.textContent = member.name;

          teamGrid.appendChild(clone);
        });
      })
      .catch((error) => console.error("Error loading team:", error));
  }

  // ===== Collaboration Marquee =====
  const collabMarquee = document.getElementById("collaborationMarquee");
  const collabTemplate = document.getElementById("collaborationTemplate");

  if (collabMarquee && collabTemplate) {
    fetch("data/collaborations.json")
      .then((response) => response.json())
      .then((collabs) => {
        // Create two marquee-content divs for infinite scroll
        for (let i = 0; i < 2; i++) {
          const marqueeContent = document.createElement("div");
          marqueeContent.classList.add("marquee-content");

          collabs.forEach((collab) => {
            const clone = collabTemplate.content.cloneNode(true);
            clone.querySelector(".collab-logo").src = collab.logo;
            clone.querySelector(".collab-logo").alt = collab.name;
            clone.querySelector(".collab-name").textContent = collab.name;
            marqueeContent.appendChild(clone);
          });

          collabMarquee.appendChild(marqueeContent);
        }
      })
      .catch((error) => console.error("Error loading collaborations:", error));
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

    if (document.querySelector(".email-container")) {
      gsap.set(".email-container > *", { y: 30 });
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
        "-=0.3",
      )
      .to(
        ".call-btn",
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.3,
          ease: "power2.out",
        },
        "-=0.2",
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

    // Section Titles (Excluding About Section Title which is handled by its card)
    const sectionTitles = gsap.utils.toArray(
      ".section-title:not(.about .section-title)",
    );
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
      const aboutTitle = aboutMain.querySelector(".section-title");
      const aboutDesc = aboutMain.querySelector(".about-description");

      // Set initial state immediately to avoid jumps
      gsap.set(aboutMain, { x: -40, autoAlpha: 0 });
      gsap.set(aboutTitle, { y: 20, autoAlpha: 0 });
      gsap.set(aboutDesc, { y: 20, autoAlpha: 0 });
      gsap.set(statCards, { y: 30, scale: 0.9, autoAlpha: 0 });

      const aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#about",
          start: "top bottom-=150", // Trigger earlier so it's visible on load/slight scroll
          once: true,
        },
      });

      aboutTl
        .to(aboutMain, {
          autoAlpha: 1,
          x: 0,
          duration: 0.8,
          ease: "power2.out",
        })
        .to(
          [aboutTitle, aboutDesc],
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.4",
        )
        .to(
          statCards,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.2)",
          },
          "-=0.4",
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
    // Email Section
    if (
      document.querySelector("#email-subscription") &&
      document.querySelector(".email-container")
    ) {
      gsap.to(".email-container > *:not(.section-title)", {
        scrollTrigger: {
          trigger: "#email-subscription",
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

    // Email Form Handler
    const emailForm = document.getElementById("emailForm");
    if (emailForm) {
      emailForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.getElementById("userEmail").value;
        const subject = encodeURIComponent("Inquiry from Glorix Website");
        const body = encodeURIComponent(
          `Hi Glorix Team,\n\nI am interested in connecting with you. My email is: ${email}\n\n[Please add your message here]`,
        );

        const mailtoUrl = `mailto:queries.glorix@gmail.com?subject=${subject}&body=${body}`;

        // Create a hidden link and click it for a more "native" browser response
        const tempLink = document.createElement("a");
        tempLink.href = mailtoUrl;
        tempLink.style.display = "none";
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      });
    }
  }

  // Event Announcement Popup
  const eventPopup = document.getElementById("eventPopup");
  const closeEventPopup = document.getElementById("closeEventPopup");

  if (eventPopup && closeEventPopup) {
    const shownKey = "inder_sahani_popup_shown";
    let countdownInterval;

    const DETAILS_PAGE = "details.html";
    const popupBookBtn = document.getElementById("eventPopupBookBtn");
    const popupBookBtnText = document.getElementById("eventPopupBookBtnText");
    const popupBookLink = "https://r.swiggy.com/v1/swiggy/scenes/comms/100107236";

    const startCountdownTimer = () => {
      const countdownElements = {
        days: document.getElementById("countdownDays"),
        hours: document.getElementById("countdownHours"),
        mins: document.getElementById("countdownMins"),
        secs: document.getElementById("countdownSecs"),
      };

      const updateCountdown = () => {
        const now = Date.now();
        const eventStarted = window.GLORIX_CONFIG.hasEventStarted();

        // Always link to booking site if bookings are open
        if (window.GLORIX_CONFIG.isBookingOpen() && popupBookBtn) {
          popupBookBtn.href = popupBookLink;
          popupBookBtn.target = "_blank";
          popupBookBtn.rel = "noopener noreferrer";
        } else if (popupBookBtn) {
          popupBookBtn.href = DETAILS_PAGE;
          popupBookBtn.removeAttribute("target");
          popupBookBtn.removeAttribute("rel");
        }

        if (eventStarted) {
          clearInterval(countdownInterval);
          const countdownContainer = document.querySelector(
            ".event-popup__countdown-container",
          );
          if (countdownContainer) countdownContainer.style.display = "none";
          const bookingOpenLabel = document.getElementById("bookingOpenLabel");
          if (bookingOpenLabel) bookingOpenLabel.textContent = "Event is here!";
          const countdownLabelSub = document.getElementById("countdownLabelSub");
          if (countdownLabelSub) countdownLabelSub.textContent = "See you at the event";
          const bookingOpenDate = document.getElementById("bookingOpenDate");
          if (bookingOpenDate) bookingOpenDate.style.display = "none";
          if (popupBookBtnText) popupBookBtnText.textContent = "BOOK NOW";
          return;
        }

        const targetDate = new Date(
          window.GLORIX_CONFIG.getEventStartsAtISO(),
        ).getTime();
        const distance = targetDate - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (countdownElements.days) {
          countdownElements.days.textContent = String(days).padStart(2, "0");
        }
        if (countdownElements.hours) {
          countdownElements.hours.textContent = String(hours).padStart(2, "0");
        }
        if (countdownElements.mins) {
          countdownElements.mins.textContent = String(minutes).padStart(2, "0");
        }
        if (countdownElements.secs) {
          countdownElements.secs.textContent = String(seconds).padStart(2, "0");
        }
      };

      updateCountdown();
      clearInterval(countdownInterval);
      countdownInterval = setInterval(updateCountdown, 1000);
    };

    // Wait for the event start date to load before starting the timer
    window.GLORIX_CONFIG.ready.then(startCountdownTimer);

    // Independent watcher: dispatch booking-opened when bookings first open
    // (keeps carousel live-render working irrespective of the popup timer)
    window.GLORIX_CONFIG.ready.then(() => {
      let wasOpen = window.GLORIX_CONFIG.isBookingOpen();
      setInterval(() => {
        const nowOpen = window.GLORIX_CONFIG.isBookingOpen();
        if (nowOpen && !wasOpen) {
          document.dispatchEvent(new Event("booking-opened"));
          wasOpen = true;
        }
      }, 1000);
    });

    if (!sessionStorage.getItem(shownKey)) {
      setTimeout(() => {
        eventPopup.showModal();
        sessionStorage.setItem(shownKey, "1");
      }, 300);
    }

    closeEventPopup.addEventListener("click", () => {
      eventPopup.close();
    });

    eventPopup.addEventListener("click", (e) => {
      if (e.target === eventPopup) {
        eventPopup.close();
      }
    });
  }
});
