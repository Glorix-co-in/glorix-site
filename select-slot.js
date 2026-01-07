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
});

let currentEvent = null;
let selectedDate = null;
let selectedTime = null;

async function loadEventData(eventId) {
    try {
        const response = await fetch("data/events.json");
        const events = await response.json();
        currentEvent = events.find((e) => e.id === eventId);

        if (!currentEvent) {
            window.location.href = "bookings.html";
            return;
        }

        populateInfo(currentEvent);
        renderSlots(currentEvent);
    } catch (error) {
        console.error("Error loading event:", error);
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
        if (event.bookingLink) {
            window.location.href = event.bookingLink;
        }
        return;
    }

    const dateSection = document.getElementById("dateSection");
    const timeSection = document.getElementById("timeSection");
    const dateSlots = document.getElementById("dateSlots");
    const timeSlots = document.getElementById("timeSlots");

    // Get unique dates
    const uniqueDates = [...new Set(options.map(opt => opt.date))];

    if (uniqueDates.length > 1) {
        dateSection.style.display = "block";
        dateSlots.innerHTML = uniqueDates.map(date => {
            const formattedDate = formatDate(date);
            return `
                <div class="slot-card" data-date="${date}">
                    <span class="slot-date-full">${formattedDate}</span>
                </div>
            `;
        }).join("");

        const dateCards = dateSlots.querySelectorAll(".slot-card");
        dateCards.forEach(card => {
            card.addEventListener("click", () => {
                dateCards.forEach(c => c.classList.remove("selected"));
                card.classList.add("selected");
                selectedDate = card.dataset.date;
                selectedTime = null; // Reset time selection
                updateTimeSlots(options.filter(opt => opt.date === selectedDate));
            });
        });

        // Auto-select first date
        dateCards[0].click();
    } else {
        // Only one date, show times immediately
        selectedDate = uniqueDates[0];
        updateTimeSlots(options);
    }
}

function updateTimeSlots(times) {
    const timeSection = document.getElementById("timeSection");
    const timeSlots = document.getElementById("timeSlots");
    const confirmBtn = document.getElementById("confirmBtn");

    timeSection.style.display = "block";
    timeSlots.innerHTML = times.map(opt => `
        <div class="slot-card ${opt.status || 'available'}" data-time="${opt.time}" data-link="${opt.link}">
            <span class="slot-time">${opt.time}</span>
        </div>
    `).join("");

    const timeCards = timeSlots.querySelectorAll(".slot-card");
    timeCards.forEach(card => {
        card.addEventListener("click", () => {
            timeCards.forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            selectedTime = card.dataset.time;

            confirmBtn.disabled = false;
            confirmBtn.onclick = () => {
                window.open(card.dataset.link, "_blank");
            };
        });
    });

    if (times.length === 1) {
        timeCards[0].click();
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
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        return `${days[dateObj.getDay()]} ${String(dateObj.getDate()).padStart(2, '0')} ${months[dateObj.getMonth()]}`;
    } catch (e) {
        return dateStr;
    }
}

