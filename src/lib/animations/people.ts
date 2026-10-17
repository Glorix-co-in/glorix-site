import {
  animateSectionTitles,
  gsap,
  useAnimations,
  type AnimationRoot,
} from "./core";

export function usePeopleAnimations(root: AnimationRoot) {
  useAnimations(root, (page) => {
    animateSectionTitles(page);
    const grid = page.querySelector('[data-animate="people"]');
    if (!grid) return;
    gsap.set(grid, { y: 50, autoAlpha: 0 });
    gsap.to(grid, {
      scrollTrigger: { trigger: grid, start: "top 75%", once: true },
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  });
}
