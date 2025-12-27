document.addEventListener("DOMContentLoaded", function () {
  let currentIndex = 0;
  const cards = document.querySelectorAll(".event-card");
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
      // Reset for desktop view where all cards might be shown via grid
      cards.forEach((card) => card.classList.remove("active"));
    }
  });
});
