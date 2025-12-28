document.addEventListener("DOMContentLoaded", function () {
  // ===== Navbar Toggle & Active Link =====
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-center a");
  let currentPage = window.location.pathname.split("/").pop() || "index.html";

  if (hamburger && navMenu) {
    const spans = hamburger.querySelectorAll("span");
    const tl = gsap.timeline({ paused: true, reversed: true });

    tl.to(spans[0], { y: 6, rotation: 45, duration: 0.3, ease: "power2.inOut" })
      .to(spans[1], { opacity: 0, duration: 0.3, ease: "power2.inOut" }, "<")
      .to(
        spans[2],
        { y: -6, rotation: -45, duration: 0.3, ease: "power2.inOut" },
        "<"
      );

    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");

      if (hamburger.classList.contains("active")) {
        tl.play();
      } else {
        tl.reverse();
      }
    });

    navLinks.forEach((link) => {
      // Set active class
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
      }

      // Close menu when clicking a link
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");

        // Handle internal links
        if (href.includes("#")) {
          const [page, hash] = href.split("#");
          // Check if we are already on the target page
          const isSamePage = page === "" || page === currentPage;

          if (isSamePage) {
            if (hash) {
              const targetElement = document.getElementById(hash);
              if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                  top: targetElement.offsetTop - 80,
                  behavior: "smooth",
                });
              }
            } else if (href === "#") {
              // Handle "Home" or top of page links
              e.preventDefault();
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }
          }
        }

        if (hamburger.classList.contains("active")) {
          hamburger.classList.remove("active");
          navMenu.classList.remove("active");
          tl.reverse();
        }
      });
    });
  }

  // ===== Handle Hash Scroll on Load =====
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      // Use a timeout to ensure the page has rendered and GSAP has set initial states
      setTimeout(() => {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust for navbar height
          behavior: "smooth",
        });
      }, 500);
    }
  }

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
