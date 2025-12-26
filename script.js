const slides = document.querySelectorAll('.carousel-slide');
const track = document.querySelector('.carousel-track');
const carousel = document.querySelector('.carousel');

let currentIndex = 0;
let autoplayInterval;
const totalSlides = slides.length;
const intervalTime = 4000; // every 4 seconds
const transitionTime = 800; // must match CSS transition

function showSlide(index) {
  // Keep it looping
  currentIndex = (index + totalSlides) % totalSlides;
  track.style.transition = `transform ${transitionTime}ms ease-in-out`;
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
}

function startAutoplay() {
  autoplayInterval = setInterval(() => {
    showSlide(currentIndex + 1);
  }, intervalTime);
}

function stopAutoplay() {
  clearInterval(autoplayInterval);
}

// Optional: seamless reset to first slide after last
track.addEventListener('transitionend', () => {
  if (currentIndex >= totalSlides) {
    track.style.transition = 'none';
    currentIndex = 0;
    track.style.transform = 'translateX(0)';
  }
});

// Prevent mobile swipe/scroll interference
carousel.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

// Pause autoplay on hover (desktop)
carousel.addEventListener('mouseenter', stopAutoplay);
carousel.addEventListener('mouseleave', startAutoplay);

// Init slider
showSlide(0);
startAutoplay();

// ===== Hamburger (safe toggle) =====
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('.nav-center');
if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('active');
  });
}

