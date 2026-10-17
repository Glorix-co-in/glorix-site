import { createEffect, type Accessor } from "solid-js";
import { animationContext, gsap, type AnimationRoot } from "./core";

const animatedRoutes = new Set(["/", "/bookings", "/artists", "/team"]);

export function useHeaderAnimations(
  root: AnimationRoot,
  pathname: Accessor<string>,
) {
  createEffect(
    pathname,
    (path) => {
      if (!animatedRoutes.has(path.replace(/\/$/, "") || "/")) return;
      return animationContext(root(), () => {
        gsap.set('[data-animate="header-logo"]', { y: -30 });
        gsap.set('[data-animate="header-navigation"] li', { y: -20 });
        gsap.set('[data-animate="header-action"]', { x: 30 });
        gsap
          .timeline()
          .to('[data-animate="header-logo"]', {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          })
          .to(
            '[data-animate="header-navigation"] li',
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
            '[data-animate="header-action"]',
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.3,
              ease: "power2.out",
            },
            "-=0.2",
          );
      });
    },
    { name: "navigation-entrance-animation" },
  );
}
