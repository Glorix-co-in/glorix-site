import styles from "./Testimonials.module.css";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onSettled,
} from "solid-js";
import { useContent } from "../content/useContent";
import { useMediaQuery } from "../lib/useMediaQuery";
export default function Testimonials() {
  const content = useContent();
  const mobile = useMediaQuery("(max-width: 768px)");
  const [page, setPage] = createSignal(0, { name: "testimonial-page" });
  const [paused, setPaused] = createSignal(false, {
    name: "testimonials-paused",
  });
  const pages = createMemo(
    () =>
      Array.from(
        { length: Math.ceil(content.testimonials.length / (mobile() ? 1 : 2)) },
        (_, i) => i,
      ),
    { name: "testimonial-pages" },
  );
  let wrapper!: HTMLDivElement;
  createEffect(
    () => ({ page: page() % Math.max(1, pages().length), mobile: mobile() }),
    ({ page: current }) => {
      wrapper.scrollTo({
        left: current * wrapper.clientWidth,
        behavior: "smooth",
      });
    },
    { name: "testimonial-scroll" },
  );
  onSettled(() => {
    const timer = setInterval(() => {
      if (!paused() && !document.hidden && pages().length > 0)
        setPage((value) => (value + 1) % pages().length);
    }, 4000);
    return () => clearInterval(timer);
  });
  return (
    <>
      <div
        class={styles.slider}
        ref={(el) => {
          wrapper = el;
        }}
        onTouchStart={() => setPaused(true)}
        onMouseDown={() => setPaused(true)}
        data-animate="testimonials"
      >
        <div class={styles.slides} id="testimonialSlides">
          <For each={content.testimonials}>
            {(review) => (
              <div class={styles.item}>
                <div class={styles.card}>
                  <div>
                    <img
                      src={"/" + review.image}
                      alt={review.name}
                      class={styles.image}
                      loading="lazy"
                    />
                    <p class={styles.text}>"{review.text}"</p>
                  </div>
                  <div>
                    <h4 class={styles.name}>{review.name}</h4>
                    <span class={styles.role}>{review.role}</span>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
      <div class={styles.dots} id="testimonialDots">
        <For each={pages()}>
          {(item) => (
            <span
              role="button"
              tabindex="0"
              class={{
                [styles.dot]: true,
                [styles.active]: page() % Math.max(1, pages().length) === item,
              }}
              aria-label={"Go to testimonial page " + (item + 1)}
              onClick={() => setPage(item)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setPage(item);
                }
              }}
            />
          )}
        </For>
      </div>
    </>
  );
}
