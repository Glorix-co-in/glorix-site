import { gsap, useAnimations, type AnimationRoot } from "./core";

export function useGalleryAnimations(root: AnimationRoot) {
  useAnimations(root, (page) => {
    gsap.to('[data-animate="title"]', {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
    });
    const grid = page.querySelector('[data-animate="gallery"]');
    if (!grid) return;
    gsap.to(grid, {
      autoAlpha: 1,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: grid,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
    const items = grid.querySelectorAll('[data-animate="gallery-item"]');
    if (items.length) {
      gsap.from(items, {
        duration: 0.8,
        opacity: 0,
        stagger: 0.05,
        ease: "power3.out",
        scrollTrigger: {
          trigger: grid,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }
  });
}
