document.addEventListener("DOMContentLoaded", function () {
  const eventsContainer = document.getElementById("eventsContainer");
  const eventCardTemplate = document.getElementById("eventCardTemplate");

  let cards = [];

  // Load events from JSON
  const upcomingContainer = document.getElementById("upcomingEventsContainer");
  const pastContainer = document.getElementById("pastEventsContainer");

  if (upcomingContainer && pastContainer) {
    const isMobile = window.innerWidth <= 768;
    const templateId = isMobile ? "mobileEventCardTemplate" : "eventCardTemplate";
    const eventCardTemplate = document.getElementById(templateId);

    if (eventCardTemplate) {
      fetch("data/events.json")
        .then((response) => response.json())
        .then((events) => {
          let upcomingCount = 0;
          let pastCount = 0;

          events.forEach((event) => {
            const isUpcoming = event.status === "open";
            const container = isUpcoming ? upcomingContainer : pastContainer;

            if (isUpcoming) upcomingCount++;
            else pastCount++;

            const clone = eventCardTemplate.content.cloneNode(true);
            const prefix = isMobile ? ".event-card-mobile" : ".event-card";

            const img = clone.querySelector(`${prefix}__image img`);
            img.src = event.image;
            img.alt = event.title;

            clone.querySelector(`${prefix}__title`).textContent = event.title;

            let dateText = event.date;
            if (isMobile) {
              // Extract day (e.g., 24th) and short month (e.g., Dec)
              const match = event.date.match(/(\d+(?:st|nd|rd|th))\s+([A-Za-z]+)/);
              if (match) {
                dateText = `${match[1]} ${match[2].substring(0, 3)}`;
              }
            }
            clone.querySelector(`${prefix}__date`).textContent = dateText;

            const btn = clone.querySelector(`${prefix}__btn`);

            if (event.status === "open" && event.bookingLink) {
              btn.textContent = "Book Now";
              btn.classList.add(`${prefix.substring(1)}__btn--open`);
              btn.addEventListener("click", () => {
                window.open(event.bookingLink, "_blank");
              });
            } else {
              btn.textContent = isMobile ? "Closed" : "Bookings Closed";
              btn.classList.add(`${prefix.substring(1)}__btn--closed`);
              btn.disabled = true;
            }

            container.appendChild(clone);
          });

          // Show messages if no events
          if (upcomingCount === 0) {
            upcomingContainer.innerHTML = '<p style="color: #666; text-align: center; grid-column: 1/-1; padding: 40px;">No upcoming events at the moment. Stay tuned!</p>';
          }
          if (pastCount === 0) {
            pastContainer.innerHTML = '<p style="color: #666; text-align: center; grid-column: 1/-1; padding: 40px;">No past events to show.</p>';
          }

          initGSAPAnimations();
        })
        .catch((error) => console.error("Error loading events:", error));
    }
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
});
