document.addEventListener("DOMContentLoaded", function () {
  const eventsContainer = document.getElementById("eventsContainer");
  const eventCardTemplate = document.getElementById("eventCardTemplate");

  let currentIndex = 0;
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
      })
      .catch((error) => console.error("Error loading events:", error));
  }

  function initMobileCarousel() {
    cards = document.querySelectorAll(".event-card");
    const totalCards = cards.length;

    function showCard(index) {
      cards.forEach((card, i) => {
        card.classList.toggle("active", i === index);
      });
    }

    window.prevCard = function () {
      currentIndex = (currentIndex - 1 + totalCards) % totalCards;
      showCard(currentIndex);
    };

    window.nextCard = function () {
      currentIndex = (currentIndex + 1) % totalCards;
      showCard(currentIndex);
    };

    // Initialize for mobile
    if (window.innerWidth <= 768) {
      showCard(currentIndex);
    }

    window.addEventListener("resize", () => {
      if (window.innerWidth <= 768) {
        showCard(currentIndex);
      } else {
        // Reset for desktop view where all cards are shown via grid
        cards.forEach((card) => card.classList.remove("active"));
      }
    });
  }
});
