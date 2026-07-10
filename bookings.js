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
    const cleanDate = dateStr.replace(/(\d+)(st|nd|rd|th)/g, "$1").trim();
    return new Date(cleanDate);
  }

  function getEventDate(event, allEvents) {
    if (!event) return new Date(0);

    // For split events, use first child's date for ordering.
    if (event.isSplitEvent && event.variantIds && event.variantIds.length > 0) {
      const firstVariant = allEvents.find((e) => e.id === event.variantIds[0]);
      if (firstVariant) return getEventDate(firstVariant, allEvents);
    }

    let dateStr = event.date || "";
    if (!dateStr) return new Date(0);

    // Handle multipart date strings like "18th & 19th April 2026" and "18th - 19th April 2026"
    if (dateStr.includes("&")) {
      dateStr = dateStr.split("&")[0].trim();
    } else if (dateStr.includes("-")) {
      const dashParts = dateStr.split("-");
      if (dashParts.length > 0) {
        dateStr = dashParts[0].trim();
      }
    }

    return parseDate(dateStr);
  }

  function renderEvents() {
    if (!upcomingContainer || !pastContainer) return;

    const isMobile = window.innerWidth <= 768;
    const templateId = isMobile
      ? "mobileEventCardTemplate"
      : "eventCardTemplate";
    const eventCardTemplate = document.getElementById(templateId);

    if (!eventCardTemplate) return;

    function isEventVisible(event) {
      return event.hiddenFromBookings !== true && event.status !== "hidden";
    }

    // Clear containers
    upcomingContainer.innerHTML = "";
    pastContainer.innerHTML = "";

    const upcomingEvents = allEvents
      .filter(
        (e) =>
          isEventVisible(e) &&
          (e.status === "open" ||
            e.status === "available" ||
            e.status === "filling-fast" ||
            e.status === "sold-out" ||
            e.status === "soon"),
      )
      .sort((a, b) => getEventDate(a, allEvents) - getEventDate(b, allEvents));

    const pastEvents = allEvents
      .filter(
        (e) =>
          isEventVisible(e) &&
          !(
            e.status === "open" ||
            e.status === "available" ||
            e.status === "filling-fast" ||
            e.status === "sold-out" ||
            e.status === "soon"
          ),
      )
      .sort((a, b) => getEventDate(b, allEvents) - getEventDate(a, allEvents));

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
        // Edge case: GLORY'26 uses horizontal poster
        if (event.id === "glory-26") {
          imageEl.src = "assets/poster3.jpeg";
          imgContainer.style.setProperty("--bg-image", "url('assets/poster3.jpeg')");
          imgContainer.closest(`${prefix}`)?.classList.add("event-card--featured");
        } else {
          imageEl.src = event.image;
          imageEl.alt = event.title;
          imgContainer.style.setProperty("--bg-image", `url('${event.image}')`);
        }
      }

      clone.querySelector(`${prefix}__title`).textContent = event.title;

      let dateText = event.date;
      if (isMobile) {
        // Preserve date ranges like "18th & 19th April" or "18th - 19th April" on mobile
        const match = event.date.match(
          /(\d+(?:st|nd|rd|th)(?:\s*(?:&|-)?\s*\d+(?:st|nd|rd|th))?)\s+([A-Za-z]+)/,
        );
        if (match) {
          dateText = `${match[1]} ${match[2].substring(0, 3)}`;
        }
      }
      clone.querySelector(`${prefix}__date`).textContent = dateText;

      const btn = clone.querySelector(`${prefix}__btn`);
      if (btn) {
        btn.textContent = isMobile ? "View" : "View Details";
        btn.classList.add(`${prefix.substring(1)}__btn--view`);
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          window.location.href = `details.html?id=${event.id}`;
        });
      }

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
