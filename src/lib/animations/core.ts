import { onSettled, type Accessor } from "solid-js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export { gsap };
export type AnimationRoot = Accessor<HTMLElement>;

export function animationContext(
  root: HTMLElement,
  animate: (root: HTMLElement) => void,
) {
  gsap.registerPlugin(ScrollTrigger);
  const context = gsap.context(() => animate(root), root);
  return () => context.revert();
}

export function useAnimations(
  root: AnimationRoot,
  animate: (root: HTMLElement) => void,
) {
  onSettled(() => animationContext(root(), animate));
}

export function animateSectionTitles(root: HTMLElement) {
  const titles = root.querySelectorAll('[data-animate="title"]');
  titles.forEach((title) => {
    gsap.set(title, { y: 40 });
    gsap.to(title, {
      scrollTrigger: { trigger: title, start: "top 90%", once: true },
      autoAlpha: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
    });
  });
}
