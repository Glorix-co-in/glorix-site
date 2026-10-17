import { gsap, useAnimations, type AnimationRoot } from "./core";

export function useBookingsAnimations(root: AnimationRoot) {
  useAnimations(root, (page) => {
    gsap.set('[data-animate="bookings-hero"]', { scale: 1.05 });
    gsap.set('[data-animate="booking-ticker"]', { y: 20 });
    gsap.set('[data-animate="title"]', { y: 30 });
    gsap.to('[data-animate="bookings-hero"]', {
      autoAlpha: 1,
      scale: 1,
      duration: 0.6,
      ease: "power2.out",
    });
    gsap.to('[data-animate="booking-ticker"]', {
      autoAlpha: 1,
      y: 0,
      duration: 0.4,
      delay: 0.2,
      ease: "power2.out",
    });

    const section = page.querySelector('[data-animate="events"]');
    if (section) {
      gsap.to('[data-animate="title"]', {
        scrollTrigger: { trigger: section, start: "top 85%", once: true },
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }
    const container = page.querySelector('[data-animate="events-list"]');
    const cards = page.querySelectorAll('[data-animate="event-card"]');
    if (container && cards.length) {
      gsap.set(cards, { y: 40, autoAlpha: 0 });
      gsap.to(cards, {
        scrollTrigger: { trigger: container, start: "top 80%", once: true },
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
      });
    }
  });
}
