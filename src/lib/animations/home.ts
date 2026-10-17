import {
  animateSectionTitles,
  gsap,
  useAnimations,
  type AnimationRoot,
} from "./core";

function animateAbout(page: HTMLElement) {
  const card = page.querySelector('[data-animate="about-card"]');
  const section = page.querySelector("#about");
  if (!card || !section) return;
  const copy = card.querySelectorAll(
    '[data-animate="about-title"], [data-animate="about-copy"]',
  );
  const stats = section.querySelectorAll('[data-animate="stat"]');
  gsap.set(card, { x: -40, autoAlpha: 0 });
  gsap.set(copy, { y: 20, autoAlpha: 0 });
  gsap.set(stats, { y: 30, scale: 0.9, autoAlpha: 0 });
  gsap
    .timeline({
      scrollTrigger: { trigger: section, start: "top bottom-=150", once: true },
    })
    .to(card, { autoAlpha: 1, x: 0, duration: 0.8, ease: "power2.out" })
    .to(
      copy,
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
      stats,
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

function animateTestimonials(page: HTMLElement) {
  const section = page.querySelector("#testimonials");
  const slider = section?.querySelector('[data-animate="testimonials"]');
  if (!slider || !section) return;
  gsap.set(slider, { y: 50 });
  gsap.to(slider, {
    scrollTrigger: { trigger: section, start: "top 75%", once: true },
    autoAlpha: 1,
    y: 0,
    duration: 0.6,
    ease: "power2.out",
  });
}

function animateCollaborations(page: HTMLElement) {
  const section = page.querySelector('[data-animate="collaboration-section"]');
  const marquee = section?.querySelector('[data-animate="collaborations"]');
  if (!marquee || !section) return;
  gsap.set(marquee, { y: 50 });
  gsap.to(marquee, {
    scrollTrigger: { trigger: section, start: "top 75%", once: true },
    autoAlpha: 1,
    y: 0,
    duration: 0.6,
    ease: "power2.out",
  });
}

function animateHomeGallery(page: HTMLElement) {
  const grid = page.querySelector('[data-animate="gallery"]');
  if (!grid) return;
  gsap.set(grid, { y: 50 });
  gsap.to(grid, {
    scrollTrigger: { trigger: grid, start: "top 90%", once: true },
    autoAlpha: 1,
    y: 0,
    duration: 0.6,
    ease: "power2.out",
  });
}

function animateContact(page: HTMLElement) {
  const section = page.querySelector("#email-subscription");
  const container = section?.querySelector('[data-animate="contact"]');
  if (!container || !section) return;
  gsap.set(container.querySelectorAll(":scope > *"), { y: 30 });
  gsap.to(
    container.querySelectorAll(':scope > *:not([data-animate="title"])'),
    {
      scrollTrigger: { trigger: section, start: "top 75%", once: true },
      autoAlpha: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.1,
      ease: "power2.out",
    },
  );
}

export function useHomeAnimations(root: AnimationRoot) {
  useAnimations(root, (page) => {
    const carousel = page.querySelector('[data-animate="home-carousel"]');
    if (carousel) {
      gsap.to(carousel, {
        autoAlpha: 1,
        duration: 0.6,
        delay: 0.2,
        ease: "power1.inOut",
      });
    }
    animateSectionTitles(page);
    animateAbout(page);
    animateTestimonials(page);
    animateCollaborations(page);
    animateHomeGallery(page);
    animateContact(page);
  });
}
