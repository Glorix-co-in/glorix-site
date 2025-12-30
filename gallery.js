document.addEventListener("DOMContentLoaded", function () {
  const galleryGrid = document.getElementById("galleryGrid");
  const galleryTemplate = document.getElementById("galleryItemTemplate");

  if (galleryGrid && galleryTemplate) {
    fetch("data/gallery.json")
      .then((response) => response.json())
      .then((galleryData) => {
        galleryData.forEach((item) => {
          const clone = galleryTemplate.content.cloneNode(true);
          const img = clone.querySelector("img");
          img.src = item.src;
          img.alt = item.alt;

          // Add click event for lightbox (optional)
          clone.querySelector(".gallery-item").addEventListener("click", () => {
            console.log("Viewing image:", item.src);
          });

          galleryGrid.appendChild(clone);
        });

        // Initialize animations after items are loaded
        initGalleryAnimations();
      })
      .catch((error) => console.error("Error loading gallery data:", error));
  }

  function initGalleryAnimations() {
    // Register ScrollTrigger
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      // Animate Section Title
      gsap.to(".section-title", {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      // GSAP Animation for gallery items
      gsap.to(".gallery-grid", {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".gallery-grid",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(".gallery-item", {
        duration: 0.8,
        opacity: 0,
        y: 50,
        stagger: 0.05,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".gallery-grid",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }
  }
});
