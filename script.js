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
        "<",
      );

    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
      document.body.classList.toggle("no-scroll");

      if (hamburger.classList.contains("active")) {
        tl.play();
      } else {
        tl.reverse();
      }
    });

    const updateActiveLink = () => {
      if (currentPage === "index.html" || currentPage === "") {
        const sections = ["home", "gallery", "email-subscription"];
        const visibilityMap = {};

        const observerOptions = {
          root: null,
          rootMargin: "-10% 0px -20% 0px",
          threshold: [0, 0.1, 0.5, 0.9],
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            visibilityMap[entry.target.id] = entry.intersectionRatio;
          });

          // Find the section with the highest visibility ratio
          let mostVisible = null;
          let maxRatio = -1;

          for (const id in visibilityMap) {
            if (visibilityMap[id] > maxRatio) {
              maxRatio = visibilityMap[id];
              mostVisible = id;
            }
          }

          if (mostVisible && maxRatio > 0) {
            navLinks.forEach((link) => {
              const href = link.getAttribute("href");
              link.classList.remove("active");
              if (
                href === `#${mostVisible}` ||
                href === `index.html#${mostVisible}` ||
                (mostVisible === "home" &&
                  (href === "#" ||
                    href === "#home" ||
                    href === "index.html" ||
                    href === "index.html#home"))
              ) {
                link.classList.add("active");
              }
            });
          }
        }, observerOptions);

        sections.forEach((id) => {
          const section = document.getElementById(id);
          if (section) observer.observe(section);
        });
      } else {
        navLinks.forEach((link) => {
          const href = link.getAttribute("href");
          if (
            href === currentPage ||
            (href.includes(currentPage) && currentPage !== "index.html")
          ) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    };

    updateActiveLink();

    navLinks.forEach((link) => {
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
          document.body.classList.remove("no-scroll");
          tl.reverse();
        }
      });
    });

    // Close menu on resize if window becomes desktop size
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        if (hamburger.classList.contains("active")) {
          hamburger.classList.remove("active");
          navMenu.classList.remove("active");
          document.body.classList.remove("no-scroll");
          tl.reverse();
        }
      }
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
