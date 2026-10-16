// Original Glorix animation settings, scoped to a Solid lifecycle.
import { onSettled } from "solid-js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
export function useOriginalAnimations(page) {
  onSettled(() => {
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      if (page === "bookings") {
        if (typeof gsap !== "undefined") {
          gsap.registerPlugin(ScrollTrigger);

          // Set initial states for bookings page (only on first load)

          gsap.set(".navbar .logo", { y: -30 });
          gsap.set(".nav-center ul li", { y: -20 });
          gsap.set(".call-btn", { x: 30 });
          gsap.set(".bookings-hero", { scale: 1.05 });
          gsap.set(".offer-ticker", { y: 20 });
          gsap.set(".section-title", { y: 30 });

          gsap.set(".event-card, .event-card-mobile", { y: 40, autoAlpha: 0 });

          // Header Animations (on load)
          const headerTl = gsap.timeline();
          headerTl
            .to(".navbar .logo", {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
            })
            .to(
              ".nav-center ul li",
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.3,
                stagger: 0.05,
                ease: "power2.out",
              },
              "-=0.3",
            )
            .to(
              ".call-btn",
              {
                autoAlpha: 1,
                x: 0,
                duration: 0.3,
                ease: "power2.out",
              },
              "-=0.2",
            );

          // Hero Banner
          gsap.to(".bookings-hero", {
            autoAlpha: 1,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
          });

          // Offer Ticker
          gsap.to(".offer-ticker", {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
            delay: 0.2,
            ease: "power2.out",
          });

          // Events Title
          gsap.to(".section-title", {
            scrollTrigger: {
              trigger: ".events-section",
              start: "top 85%",
              once: true,
            },
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          });

          // Event Cards Stagger
          gsap.to(".event-card, .event-card-mobile", {
            scrollTrigger: {
              trigger: ".events-container",
              start: "top 80%",
              once: true,
            },
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
          });
        }
      } else if (page === "gallery") {
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
      } else {
        // Set initial states for elements that will animate in
        gsap.set(".navbar .logo", { y: -30 });
        gsap.set(".nav-center ul li", { y: -20 });
        gsap.set(".call-btn", { x: 30 });
        gsap.set(".section-title", { y: 40 });

        const gridElements = [
          ".review-slider-wrapper",
          ".gallery-grid",
          ".marquee",
        ];
        gridElements.forEach((selector) => {
          if (document.querySelector(selector)) {
            gsap.set(selector, { y: 50 });
          }
        });

        if (document.querySelector(".email-container")) {
          gsap.set(".email-container > *", { y: 30 });
        }

        // Header Animations (on load)
        const headerTl = gsap.timeline();
        headerTl
          .to(".navbar .logo", {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          })
          .to(
            ".nav-center ul li",
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.3,
              stagger: 0.05,
              ease: "power2.out",
            },
            "-=0.3",
          )
          .to(
            ".call-btn",
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.3,
              ease: "power2.out",
            },
            "-=0.2",
          );

        // Hero Carousel Animation
        if (document.querySelector(".carousel-wrapper")) {
          gsap.to(".carousel-wrapper", {
            autoAlpha: 1,
            duration: 0.6,
            delay: 0.2,
            ease: "power1.inOut",
          });
        }

        // Section Titles (Excluding About Section Title which is handled by its card)
        const sectionTitles = gsap.utils.toArray(
          ".section-title:not(.about .section-title)",
        );
        sectionTitles.forEach((title) => {
          gsap.to(title, {
            scrollTrigger: {
              trigger: title,
              start: "top 90%",
              once: true,
            },
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          });
        });

        // About Content - Simplified and robust entry
        const aboutMain = document.querySelector(".about-main-card");
        const statCards = gsap.utils.toArray(".stat-card");

        if (aboutMain) {
          const aboutTitle = aboutMain.querySelector(".section-title");
          const aboutDesc = aboutMain.querySelector(".about-description");

          // Set initial state immediately to avoid jumps
          gsap.set(aboutMain, { x: -40, autoAlpha: 0 });
          gsap.set(aboutTitle, { y: 20, autoAlpha: 0 });
          gsap.set(aboutDesc, { y: 20, autoAlpha: 0 });
          gsap.set(statCards, { y: 30, scale: 0.9, autoAlpha: 0 });

          const aboutTl = gsap.timeline({
            scrollTrigger: {
              trigger: "#about",
              start: "top bottom-=150", // Trigger earlier so it's visible on load/slight scroll
              once: true,
            },
          });

          aboutTl
            .to(aboutMain, {
              autoAlpha: 1,
              x: 0,
              duration: 0.8,
              ease: "power2.out",
            })
            .to(
              [aboutTitle, aboutDesc],
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out",
              },
              "-=0.4",
            )
            .to(
              statCards,
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: "back.out(1.2)",
              },
              "-=0.4",
            );
        }

        // Testimonials Content
        if (
          document.querySelector("#testimonials") &&
          document.querySelector(".review-slider-wrapper")
        ) {
          gsap.to(".review-slider-wrapper", {
            scrollTrigger: {
              trigger: "#testimonials",
              start: "top 75%",
              once: true,
            },
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          });
        }

        // Collaboration Section
        const marquee = document.querySelector(".marquee");
        if (marquee) {
          gsap.to(marquee, {
            scrollTrigger: {
              trigger: ".collaboration-section",
              start: "top 75%",
              once: true,
            },
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          });
        }

        // Gallery Grid
        const galleryGrid = document.querySelector(".gallery-grid");
        if (galleryGrid) {
          gsap.to(galleryGrid, {
            scrollTrigger: {
              trigger: galleryGrid,
              start: "top 90%",
              once: true,
            },
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          });
        }
        // Email Section
        if (
          document.querySelector("#email-subscription") &&
          document.querySelector(".email-container")
        ) {
          gsap.to(".email-container > *:not(.section-title)", {
            scrollTrigger: {
              trigger: "#email-subscription",
              start: "top 75%",
              once: true,
            },
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out",
          });
        }

        if (page === "artists" || page === "team") {
          const grid = page === "team" ? ".team-grid" : ".artists-grid";
          gsap.set(grid, { y: 50, autoAlpha: 0 });
          gsap.to(grid, {
            scrollTrigger: { trigger: grid, start: "top 75%", once: true },
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          });
        }
      }
    });
    return () => context.revert();
  });
}
