document.addEventListener("DOMContentLoaded", function () {
  const eventsContainer = document.getElementById("eventsContainer");
  const eventCardTemplate = document.getElementById("eventCardTemplate");

  let cards = [];

  // Load events from JSON
  if (eventsContainer && eventCardTemplate) {
    fetch("data/events.json")
      .then((response) => response.json())
      .then((events) => {
        events.forEach((event) => {
          const clone = eventCardTemplate.content.cloneNode(true);

          const img = clone.querySelector(".event-card__image img");
          img.src = event.image;
          img.alt = event.title;

          clone.querySelector(".event-card__title").textContent = event.title;
          clone.querySelector(".event-card__date").textContent = event.date;

          const btn = clone.querySelector(".event-card__btn");

          if (event.status === "open" && event.bookingLink) {
            btn.textContent = "Book Now";
            btn.classList.add("event-card__btn--open");
            btn.addEventListener("click", () => {
              window.open(event.bookingLink, "_blank");
            });
          } else {
            btn.textContent = "Bookings Closed";
            btn.classList.add("event-card__btn--closed");
            btn.disabled = true;
          }

          eventsContainer.appendChild(clone);
        });

        // Initialize mobile carousel after cards are loaded
        initMobileCarousel();
        initGSAPAnimations();
      })
      .catch((error) => console.error("Error loading events:", error));
  }

  function initGSAPAnimations() {
    if (typeof gsap !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // Set initial states for bookings page
      gsap.set(".navbar .logo", { y: -30 });
      gsap.set(".nav-center ul li", { y: -20 });
      gsap.set(".call-btn", { x: 30 });
      gsap.set(".bookings-hero", { scale: 1.05 });
      gsap.set(".offer-ticker", { y: 20 });
      gsap.set(".section-title", { y: 30 });
      gsap.set(".event-card", { y: 40 });

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

      // Hero Banner
      gsap.to(".bookings-hero", {
        autoAlpha: 1,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
      });

      // Offer Ticker
      gsap.to(".offer-ticker", {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        delay: 0.2,
        ease: "power2.out",
      });

      // Events Title
      gsap.to(".section-title", {
        scrollTrigger: {
          trigger: ".events-section",
          start: "top 85%",
          once: true,
        },
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      });

      // Event Cards Stagger
      gsap.to(".event-card", {
        scrollTrigger: {
          trigger: ".events-container",
          start: "top 80%",
          once: true,
        },
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
      });
    }
  }

  function initMobileCarousel() {
    cards = document.querySelectorAll(".event-card");

    window.prevCard = function () {
      if (eventsContainer) {
        const cardWidth = cards[0]?.offsetWidth || 300;
        eventsContainer.scrollBy({
          left: -(cardWidth + 40),
          behavior: "smooth",
        });
      }
    };

    window.nextCard = function () {
      if (eventsContainer) {
        const cardWidth = cards[0]?.offsetWidth || 300;
        eventsContainer.scrollBy({
          left: cardWidth + 40,
          behavior: "smooth",
        });
      }
    };
  }
});
