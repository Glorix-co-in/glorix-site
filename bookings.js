document.addEventListener("DOMContentLoaded", function () {
  const eventsContainer = document.getElementById("eventsContainer");
  const upcomingContainer = document.getElementById("upcomingEventsContainer");
  const pastContainer = document.getElementById("pastEventsContainer");
  const marqueeTrack = document.getElementById("marqueeTrack");

  let allEvents = [];
  let isMobileLocal = window.innerWidth <= 768;

  function parseDate(dateStr) {
    if (!dateStr) return new Date(0);
    // Remove ordinal suffixes (st, nd, rd, th) from numbers
    const cleanDate = dateStr.replace(/(\d+)(st|nd|rd|th)/, "$1");
    return new Date(cleanDate);
  }

  function renderEvents() {
    if (!upcomingContainer || !pastContainer) return;

    const isMobile = window.innerWidth <= 768;
    const templateId = isMobile
      ? "mobileEventCardTemplate"
      : "eventCardTemplate";
    const eventCardTemplate = document.getElementById(templateId);

    if (!eventCardTemplate) return;

    // Clear containers
    upcomingContainer.innerHTML = "";
    pastContainer.innerHTML = "";

    const upcomingEvents = allEvents
      .filter(
        (e) =>
          e.status === "open" ||
          e.status === "available" ||
          e.status === "filling-fast" ||
          e.status === "sold-out" ||
          e.status === "soon",
      )
      .sort((a, b) => parseDate(a.date) - parseDate(b.date));

    const pastEvents = allEvents
      .filter(
        (e) =>
          !(
            e.status === "open" ||
            e.status === "available" ||
            e.status === "filling-fast" ||
            e.status === "sold-out" ||
            e.status === "soon"
          ),
      )
      .sort((a, b) => parseDate(b.date) - parseDate(a.date));

    if (upcomingEvents.length > 1) {
      upcomingContainer.classList.add("is-multiple");
    } else {
      upcomingContainer.classList.remove("is-multiple");
    }

    const processEvent = (event, isUpcoming) => {
      const container = isUpcoming ? upcomingContainer : pastContainer;

      const clone = eventCardTemplate.content.cloneNode(true);
      const prefix = isMobile ? ".event-card-mobile" : ".event-card";

      const imgContainer = clone.querySelector(`${prefix}__image`);
      const imageEl = imgContainer.querySelector("img");

      if (event.details && event.details.promoVideo) {
        // Create video element
        const video = document.createElement("video");
        video.src = event.details.promoVideo;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsinline = true;
        video.preload = "auto";
        video.setAttribute("fetchpriority", "high");

        // Use a placeholder or thumbnail for the blur bg if video
        imgContainer.style.setProperty("--bg-image", `url('${event.image}')`);

        // Replace image with video
        imgContainer.replaceChild(video, imageEl);
      } else {
        imageEl.src = event.image;
        imageEl.alt = event.title;
        imgContainer.style.setProperty("--bg-image", `url('${event.image}')`);
      }

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

      // Always show view button that navigates to details page
      if (isMobile) {
        btn.textContent = "View";
      } else {
        btn.textContent = "View Details";
      }

      btn.classList.add(`${prefix.substring(1)}__btn--view`);
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.href = `details.html?id=${event.id}`;
      });

      // Make entire card clickable
      const card = clone.querySelector(prefix);
      if (card) {
        card.style.cursor = "pointer";
        card.addEventListener("click", () => {
          window.location.href = `details.html?id=${event.id}`;
        });
      }

      container.appendChild(clone);
    };

    upcomingEvents.forEach((event) => processEvent(event, true));
    pastEvents.forEach((event) => processEvent(event, false));

    // Show messages if no events
    if (upcomingEvents.length === 0) {
      upcomingContainer.innerHTML =
        '<p style="color: #666; text-align: center; grid-column: 1/-1; padding: 40px;">No upcoming events at the moment. Stay tuned!</p>';
    }
    if (pastEvents.length === 0) {
      pastContainer.innerHTML =
        '<p style="color: #666; text-align: center; grid-column: 1/-1; padding: 40px;">No past events to show.</p>';
    }

    initGSAPAnimations();
  }

  // Initial load
  if (upcomingContainer && pastContainer) {
    fetch("data/events.json")
      .then((response) => response.json())
      .then((events) => {
        allEvents = events;
        renderEvents();
      })
      .catch((error) => console.error("Error loading events:", error));
  }

  // Load marquee from JSON
  if (marqueeTrack) {
    fetch("data/marquee.json")
      .then((response) => response.json())
      .then((data) => {
        const marqueeContent = data
          .map((item) => `<span>${item.text}</span>`)
          .join("");
        // Repeat content multiple times to ensure it's wider than the screen
        const repeatedContent = marqueeContent.repeat(4);
        // Create duplicate content for seamless looping
        marqueeTrack.innerHTML = `
          <div class="offer-ticker__content">${repeatedContent}</div>
          <div class="offer-ticker__content">${repeatedContent}</div>
        `;
      })
      .catch((err) => console.error("Error loading marquee:", err));
  }

  // Debounced resize handler
  let resizeTimeout;
  window.addEventListener("resize", () => {
    const isMobileNow = window.innerWidth <= 768;
    // Only re-render if we cross the mobile/desktop threshold to prevent unnecessary reflows
    if (isMobileNow !== isMobileLocal) {
      isMobileLocal = isMobileNow;
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (allEvents.length > 0) {
          renderEvents();
        }
      }, 250);
    }
  });

  function initGSAPAnimations() {
    if (typeof gsap !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // Set initial states for bookings page (only on first load)
      if (!window.gsapInitialized) {
        gsap.set(".navbar .logo", { y: -30 });
        gsap.set(".nav-center ul li", { y: -20 });
        gsap.set(".call-btn", { x: 30 });
        gsap.set(".bookings-hero", { scale: 1.05 });
        gsap.set(".offer-ticker", { y: 20 });
        gsap.set(".section-title", { y: 30 });
        window.gsapInitialized = true;
      }

      gsap.set(".event-card, .event-card-mobile", { y: 40, autoAlpha: 0 });

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
      gsap.to(".event-card, .event-card-mobile", {
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
