document.addEventListener("DOMContentLoaded", function () {
  const galleryGrid = document.getElementById("galleryGrid");
  const galleryTemplate = document.getElementById("galleryItemTemplate");

  if (galleryGrid && galleryTemplate) {
    fetch("data/gallery.json")
      .then((response) => response.json())
      .then((galleryData) => {
        renderGallery(galleryData);
      })
      .catch((error) => console.error("Error loading gallery data:", error));
  }

  function renderGallery(data) {
    const observerOptions = {
      root: null,
      rootMargin: "400px 0px", // Load images 400px before they enter viewport
      threshold: 0.01,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const item = entry.target;
        const index = item.dataset.index;
        const itemData = data[index];

        if (entry.isIntersecting) {
          // Load content
          if (!item.querySelector("img")) {
            const img = document.createElement("img");
            img.src = itemData.src;
            img.alt = itemData.alt;
            img.loading = "lazy";
            item.appendChild(img);

            // Fade in effect
            gsap.fromTo(img, { opacity: 0 }, { opacity: 1, duration: 0.4 });
          }
        } else {
          // Unload content to save memory (Virtualization)
          const img = item.querySelector("img");
          if (img) {
            img.remove();
          }
        }
      });
    }, observerOptions);

    data.forEach((item, index) => {
      const container = document.createElement("div");
      container.className = "gallery-item";
      container.dataset.index = index;

      // Add click event for lightbox (optional)
      container.addEventListener("click", () => {
        console.log("Viewing image:", item.src);
      });

      galleryGrid.appendChild(container);
      observer.observe(container);
    });

    // Initialize animations after items are loaded
    initGalleryAnimations();
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
