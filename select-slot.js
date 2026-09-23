document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");

  if (!eventId) {
    window.location.href = "bookings.html";
    return;
  }

  loadEventData(eventId);

  const backBtn = document.getElementById("backBtn");
  backBtn.addEventListener("click", () => {
    window.history.back();
  });

  const shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", shareEvent);
  }
});

function shareEvent() {
  const title = document.getElementById("headerTitle")?.textContent || "Event";
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: `${title} - GLORIX`,
      text: `Choose a date and time for ${title}`,
      url,
    }).catch((error) => {
      if (error.name !== "AbortError") {
        console.error("Failed to share event:", error);
      }
    });
    return;
  }

  navigator.clipboard
    .writeText(url)
    .then(() => alert("Link copied to clipboard!"))
    .catch((error) => console.error("Failed to copy event link:", error));
}

let currentEvent = null;
let selectedDate = null;
let selectedTime = null;

async function loadEventData(eventId) {
  try {
    const response = await fetch("data/events.json");
    const events = await response.json();
    currentEvent = events.find((e) => e.id === eventId);

    if (!currentEvent || currentEvent.status === "hidden") {
      window.location.href = "bookings.html";
      return;
    }

    populateInfo(currentEvent);
    await window.GLORIX_CONFIG.ready;
    if (!window.GLORIX_CONFIG.isBookingOpenFor(currentEvent.id)) {
      showBookingOpeningNotice(currentEvent);
      return;
    }
    renderSlots(currentEvent);
  } catch (error) {
    console.error("Error loading event:", error);
  }
}

function showBookingOpeningNotice(event) {
  const selectionCard = document.querySelector(".selection-card");
  const confirmBtn = document.getElementById("confirmBtn");
  const dateSection = document.getElementById("dateSection");
  const timeSection = document.getElementById("timeSection");
  const legend = document.querySelector(".legend-container");
  const opensAt = window.GLORIX_CONFIG.getBookingOpensAtISOFor(event.id);
  const formattedOpenTime = opensAt
    ? new Date(opensAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "soon";

  if (dateSection) dateSection.style.display = "none";
  if (timeSection) timeSection.style.display = "none";
  if (legend) legend.style.display = "none";
  if (selectionCard) {
    const notice = document.createElement("p");
    notice.className = "booking-opening-notice";
    notice.textContent = `Bookings open ${formattedOpenTime} IST.`;
    selectionCard.prepend(notice);

    const bookingWatcher = setInterval(() => {
      if (window.GLORIX_CONFIG.isBookingOpenFor(event.id)) {
        clearInterval(bookingWatcher);
        notice.remove();
        if (legend) legend.style.display = "";
        renderSlots(event);
      }
    }, 1000);
  }
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = `Bookings open ${formattedOpenTime}`;
  }
}

function populateInfo(event) {
  document.getElementById("headerTitle").textContent = event.title;
  document.getElementById("eventTitle").textContent = event.title;
  document.getElementById("eventVenue").textContent = event.details.venue;
  document.getElementById("eventThumb").src = event.image;
  document.getElementById("eventThumb").alt = event.title;
}

function renderSlots(event) {
  const options = event.bookingOptions || [];
  if (options.length === 0) {
    if (event.bookingLink && event.bookingLink !== "null") {
      window.location.href = event.bookingLink;
    }
    return;
  }

  const dateSection = document.getElementById("dateSection");
  const timeSection = document.getElementById("timeSection");
  const dateSlots = document.getElementById("dateSlots");
  const timeSlots = document.getElementById("timeSlots");

  // Get unique dates
  const uniqueDates = [...new Set(options.map((opt) => opt.date).filter(Boolean))];

  if (uniqueDates.length >= 1) {
    dateSection.style.display = "block";
    dateSlots.innerHTML = uniqueDates
      .map((date) => {
        const formattedDate = formatDate(date);
        const dateOptions = options.filter((option) => option.date === date);
        const bookableOptions = dateOptions.filter((option) => {
          const status = option.status || "available";
          const link = typeof option.link === "string" ? option.link.trim() : "";
          return !["closed", "sold-out"].includes(status) &&
            ((link && link !== "null") || Boolean(option.detailsEventId));
        });
        const dateStatus = bookableOptions.length > 0
          ? (bookableOptions.some((option) => option.status !== "filling-fast") ? "available" : "filling-fast")
          : (dateOptions.every((option) => option.status === "sold-out") ? "sold-out" : "closed");
        return `
                <div class="slot-card ${dateStatus}" data-date="${date}">
                    <span class="slot-date-full">${formattedDate}</span>
                </div>
            `;
      })
      .join("");

    const dateCards = dateSlots.querySelectorAll(".slot-card");
    dateCards.forEach((card) => {
      card.addEventListener("click", () => {
        dateCards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedDate = card.dataset.date;
        selectedTime = null; // Reset time selection
        updateTimeSlots(options.filter((opt) => opt.date === selectedDate));
      });
    });

    // Auto-select first date
    dateCards[0].click();
  }
}

function updateTimeSlots(times) {
  const timeSection = document.getElementById("timeSection");
  const timeSlots = document.getElementById("timeSlots");
  const confirmBtn = document.getElementById("confirmBtn");

  timeSection.style.display = "block";
  timeSlots.innerHTML = "";
  times.forEach((option) => {
    const status = option.status || "available";
    const link = typeof option.link === "string" ? option.link.trim() : "";
    const detailsEventId = option.detailsEventId || "";
    const isUnavailable = ["sold-out", "closed"].includes(status) || ((!link || link === "null") && !detailsEventId);
    const card = document.createElement("div");
    card.className = `slot-card ${status}${isUnavailable ? " closed" : ""}`;
    card.dataset.time = option.time || "";
    card.dataset.link = link;
    card.dataset.detailsEventId = detailsEventId;
    card.setAttribute("aria-disabled", String(isUnavailable));

    const timeLabel = document.createElement("span");
    timeLabel.className = "slot-time";
    timeLabel.textContent = option.time || "Time TBA";
    card.appendChild(timeLabel);
    if (isUnavailable) {
      const statusLabel = document.createElement("span");
      statusLabel.className = "slot-status";
      statusLabel.textContent = status === "sold-out" ? "Sold Out" : "Unavailable";
      card.appendChild(statusLabel);
    }
    timeSlots.appendChild(card);
  });

  const timeCards = timeSlots.querySelectorAll(".slot-card");
  let firstAvailable = null;

  timeCards.forEach((card) => {
    if (
      !card.classList.contains("sold-out") &&
      !card.classList.contains("closed") &&
      ((Boolean(card.dataset.link) && card.dataset.link !== "null") || Boolean(card.dataset.detailsEventId))
    ) {
      if (!firstAvailable) firstAvailable = card;
    }

    card.addEventListener("click", () => {
      if (
        card.classList.contains("sold-out") ||
        card.classList.contains("closed") ||
        ((!card.dataset.link || card.dataset.link === "null") && !card.dataset.detailsEventId)
      ) {
        return;
      }
      timeCards.forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedTime = card.dataset.time;

      confirmBtn.disabled = false;
      confirmBtn.onclick = () => {
        if (card.dataset.detailsEventId) {
          window.location.href = `details.html?id=${encodeURIComponent(card.dataset.detailsEventId)}`;
        } else if (card.dataset.link) {
          window.open(card.dataset.link, "_blank", "noopener");
        }
      };
    });
  });

  if (firstAvailable && timeCards.length === 1) {
    firstAvailable.click();
  } else {
    confirmBtn.disabled = true;
  }
}

function formatDate(dateStr) {
  try {
    // Robust parsing for "24th December 2025"
    let cleanDate = dateStr.replace(/(\d+)(st|nd|rd|th)/, "$1");
    let dateObj = new Date(cleanDate);

    // Fallback if invalid date
    if (isNaN(dateObj.getTime())) {
      const parts = dateStr.split(" ");
      const day = parts[0].replace(/\D/g, "");
      const month = parts[1] ? parts[1].substring(0, 3) : "";
      return `${day} ${month}`;
    }

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return `${days[dateObj.getDay()]} ${String(dateObj.getDate()).padStart(
      2,
      "0",
    )} ${months[dateObj.getMonth()]}`;
  } catch (e) {
    return dateStr;
  }
}
