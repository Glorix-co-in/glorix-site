document.addEventListener("DOMContentLoaded", function () {
  let currentEvent;

  // Get event ID from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");

  if (!eventId) {
    showError("No event specified");
    return;
  }

  // Load event details
  loadEventDetails(eventId);

  // Back button handler
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "bookings.html";
      }
    });
  }

  // Share button handler
  const shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", shareEvent);
  }


  // Terms & Conditions Modal handlers
  const termsSection = document.getElementById("termsSection");
  const termsModal = document.getElementById("termsModal");
  const closeTerms = document.getElementById("closeTerms");
  const gotItBtn = document.getElementById("gotItBtn");

  const openModal = () => {
    termsModal.classList.add("active");
    document.body.classList.add("modal-open");
  };

  const closeModal = () => {
    termsModal.classList.remove("active");
    document.body.classList.remove("modal-open");
  };

  if (termsSection && termsModal) {
    termsSection.addEventListener("click", openModal);
  }

  if (closeTerms) {
    closeTerms.addEventListener("click", closeModal);
  }

  if (gotItBtn) {
    gotItBtn.addEventListener("click", closeModal);
  }

  // Close modal when clicking outside the bottom sheet
  if (termsModal) {
    termsModal.addEventListener("click", (e) => {
      if (e.target === termsModal) {
        closeModal();
      }
    });
  }
});

async function loadEventDetails(eventId) {
  try {
    const response = await fetch("data/events.json");
    if (!response.ok) {
      throw new Error("Failed to load event details");
    }

    const events = await response.json();
    const event = events.find((e) => e.id === eventId);

    if (!event) {
      showError("Event not found");
      return;
    }

    currentEvent = event;
    populateEventDetails(event);

  } catch (error) {
    console.error("Error loading event details:", error);
    showError("Failed to load event details");
  }
}

function populateEventDetails(event) {
  const details = event.details || {};

  // Update page title
  document.title = `${event.title} - GLORIX`;

  // Header title
  const headerTitle = document.getElementById("headerTitle");
  if (headerTitle) {
    headerTitle.textContent = event.title;
  }

  // Tags
  const tagsContainer = document.getElementById("eventTags");
  if (tagsContainer && details.tags) {
    tagsContainer.innerHTML = details.tags
      .map((tag) => `<span class="event-tag">${tag}</span>`)
      .join("");
  }

  // Update Media
  updateEventMedia(event);

  // Add resize listener for responsive video switching
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (currentEvent) { // Ensure currentEvent is loaded
        updateEventMedia(currentEvent);
      }
    }, 250);
  });


  // Date
  const eventDate = document.getElementById("eventDate");
  if (eventDate) {
    if (details.dateRange) {
      eventDate.textContent = details.dateRange;
    } else {
      eventDate.textContent = event.date;
    }
  }

  // Time
  const eventTime = document.getElementById("eventTime");
  if (eventTime) {
    if (Array.isArray(details.time)) {
      eventTime.textContent = details.time.join(" | ");
    } else {
      eventTime.textContent = details.time || "TBA";
    }
  }

  // Duration
  const eventDuration = document.getElementById("eventDuration");
  if (eventDuration) {
    eventDuration.textContent = details.duration;
  }

  // Age limit
  const eventAge = document.getElementById("eventAge");
  if (eventAge) {
    eventAge.textContent = details.ageLimit;
  }

  // Languages
  const eventLanguage = document.getElementById("eventLanguage");
  if (eventLanguage) {
    eventLanguage.textContent = details.languages;
  }

  // Genre
  const eventGenre = document.getElementById("eventGenre");
  if (eventGenre) {
    eventGenre.textContent = details.genre;
  }

  // Venue
  const eventVenue = document.getElementById("eventVenue");
  if (eventVenue) {
    eventVenue.textContent = details.venue;
  }

  // Venue link
  const venueLink = document.getElementById("venueLink");
  if (venueLink) {
    if (details.venueLink) {
      venueLink.href = details.venueLink;
      venueLink.style.display = "flex";
    } else {
      venueLink.style.display = "none";
    }
  }

  // About text
  const aboutText = document.getElementById("aboutText");
  if (aboutText) {
    aboutText.textContent = details.aboutEvent;
  }


  // Price
  const priceFrom = document.getElementById("priceFrom");
  if (priceFrom) {
    priceFrom.textContent = details.priceFrom || "TBA";
  }

  // Availability and booking button
  const availability = document.getElementById("availability");
  const bookNowBtn = document.getElementById("bookNowBtn");

  const status = event.status || "closed";
  const isOpen = status !== "closed" && event.bookingLink;

  if (isOpen) {
    if (availability) {
      let statusText = "Available";
      let statusClass = "available";

      if (status === "fast-filling") {
        statusText = "Fast Filling";
        statusClass = "fast-filling";
      } else if (status === "sold-out") {
        statusText = "Sold Out";
        statusClass = "sold-out";
      }

      availability.textContent = statusText;
      availability.className = `availability ${statusClass}`;
    }

    if (bookNowBtn) {
      if (status === "sold-out") {
        bookNowBtn.textContent = "Sold Out";
        bookNowBtn.disabled = true;
        bookNowBtn.classList.add("disabled");
      } else {
        bookNowBtn.textContent = "Book Now";
        bookNowBtn.disabled = false;
        bookNowBtn.classList.remove("disabled");
        bookNowBtn.addEventListener("click", () => {
          if (event.bookingOptions && event.bookingOptions.length > 1) {
            window.location.href = `select-slot.html?id=${event.id}`;
          } else {
            window.open(event.bookingLink, "_blank");
          }
        });
      }
    }
  } else {
    if (availability) {
      availability.textContent = "Bookings Closed";
      availability.className = "availability closed";
    }
    if (bookNowBtn) {
      bookNowBtn.textContent = "Bookings Closed";
      bookNowBtn.disabled = true;
      bookNowBtn.classList.add("disabled");
    }
  }
}

function showError(message) {
  const main = document.querySelector(".details-main");
  if (main) {
    main.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <h2>Oops!</h2>
        <p>${message}</p>
        <a href="bookings.html" style="margin-top: 16px; color: #1877f2; text-decoration: none;">
          ← Back to Events
        </a>
      </div>
    `;
  }

  // Hide sticky bar on error
  const stickyBar = document.querySelector(".sticky-bottom-bar");
  if (stickyBar) {
    stickyBar.style.display = "none";
  }
}

function shareEvent() {
  const title = document.getElementById("headerTitle")?.textContent || "Event";
  const url = window.location.href;

  if (navigator.share) {
    navigator
      .share({
        title: `${title} - GLORIX`,
        text: `Check out this event: ${title}`,
        url: url,
      })
      .catch((err) => console.log("Share cancelled or failed:", err));
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch((err) => console.error("Failed to copy:", err));
  }
}

function updateEventMedia(event) {
  const details = event.details || {};
  const eventImage = document.getElementById("eventImage");
  const eventVideo = document.getElementById("eventVideo");

  if (details.detailsVideo) {
    if (eventVideo) {
      let videoSrc = "";
      if (typeof details.detailsVideo === "object") {
        const isLandscapeMode = window.innerWidth <= 1024;
        // User requested: landscape for mobile & tablet, portrait for desktop
        videoSrc = isLandscapeMode ? details.detailsVideo.landscape : details.detailsVideo.portrait;
      } else {
        videoSrc = details.detailsVideo;
      }

      // Only update if source changed to prevent flickering
      const newSrcUrl = new URL(videoSrc, window.location.href).href;
      if (eventVideo.src !== newSrcUrl) {
        eventVideo.src = videoSrc;
        eventVideo.preload = "auto";
        eventVideo.setAttribute("fetchpriority", "high");
      }

      eventVideo.style.display = "block";
    }
    if (eventImage) {
      eventImage.style.display = "none";
    }
  } else if (eventImage) {
    // Priority: detailsImage > image
    eventImage.src = details.detailsImage || event.image;
    eventImage.alt = event.title;
    eventImage.style.display = "block";
    if (eventVideo) {
      eventVideo.style.display = "none";
    }
  }
}
