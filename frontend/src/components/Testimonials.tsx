import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onSettled,
} from "solid-js";
import reviews from "../data/testimonials.json";
import { useMediaQuery } from "../lib/useMediaQuery";
export default function Testimonials() {
  const mobile = useMediaQuery("(max-width: 768px)");
  const [page, setPage] = createSignal(0, { name: "testimonial-page" });
  const [paused, setPaused] = createSignal(false, {
    name: "testimonials-paused",
  });
  const pages = createMemo(
    () =>
      Array.from(
        { length: Math.ceil(reviews.length / (mobile() ? 1 : 2)) },
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
      if (!paused() && !document.hidden)
        setPage((value) => (value + 1) % pages().length);
    }, 4000);
    return () => clearInterval(timer);
  });
  return (
    <>
      <div
        class="review-slider-wrapper"
        ref={(el) => {
          wrapper = el;
        }}
        onTouchStart={() => setPaused(true)}
        onMouseDown={() => setPaused(true)}
      >
        <div class="review-slides" id="testimonialSlides">
          <For each={reviews}>
            {(review) => (
              <div class="review-item">
                <div class="review-box">
                  <div>
                    <img
                      src={"/" + review.image}
                      alt={review.name}
                      class="reviewer-img"
                      loading="lazy"
                    />
                    <p class="review-text">"{review.text}"</p>
                  </div>
                  <div>
                    <h4 class="reviewer-name">{review.name}</h4>
                    <span class="reviewer-role">{review.role}</span>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
      <div class="slider-dots" id="testimonialDots">
        <For each={pages()}>
          {(item) => (
            <span
              role="button"
              tabindex="0"
              class={{
                dot: true,
                active: page() % Math.max(1, pages().length) === item,
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
