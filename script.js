document.addEventListener("DOMContentLoaded", function () {
  // ===== Navbar Toggle =====
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("navMenu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }

  // ===== Navbar Active Link =====
  const navLinks = document.querySelectorAll(".nav-center a");
  let currentPage = window.location.pathname.split("/").pop() || "index.html";

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });

  // ===== Music Player =====
  const music = document.getElementById("bgMusic");
  const musicBtn = document.getElementById("musicBtn");

  if (music && musicBtn) {
    const savedState = localStorage.getItem("musicPlaying");
    const savedTime = parseFloat(localStorage.getItem("musicTime")) || 0;

    music.currentTime = savedTime;
    if (savedState === "true") {
      music.play().catch(() => {
        // Autoplay might be blocked
        localStorage.setItem("musicPlaying", "false");
        musicBtn.innerHTML = "▶";
      });
      musicBtn.innerHTML = "⏸";
    }

    musicBtn.addEventListener("click", () => {
      if (music.paused) {
        music.play();
        musicBtn.innerHTML = "⏸";
        localStorage.setItem("musicPlaying", "true");
      } else {
        music.pause();
        musicBtn.innerHTML = "▶";
        localStorage.setItem("musicPlaying", "false");
      }
    });

    music.addEventListener("timeupdate", () => {
      localStorage.setItem("musicTime", music.currentTime);
    });
  }
});
