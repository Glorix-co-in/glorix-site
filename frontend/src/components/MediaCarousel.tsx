import { createSignal, For, onSettled, Show } from "solid-js";
import { useMediaQuery } from "../lib/useMediaQuery";
export interface Slide {
  desktopImage: string;
  mobileImage?: string;
  alt?: string;
  href?: string;
}
export default function MediaCarousel(props: {
  slides: Slide[];
  label: string;
  home?: boolean;
}) {
  const mobile = useMediaQuery(() =>
    props.home ? "(max-width: 768px)" : "(max-width: 1024px)",
  );
  const [index, setIndex] = createSignal(0, { name: "carousel-index" });
  let startX = 0;
  onSettled(() => {
    const timer = setInterval(() => {
      if (!document.hidden && props.slides.length > 1)
        setIndex((value) => (value + 1) % props.slides.length);
    }, 3000);
    return () => clearInterval(timer);
  });
  const image = (slide: Slide) =>
    "/" +
    (mobile() ? slide.mobileImage || slide.desktopImage : slide.desktopImage);
  const content = (
    <>
      <div
        class="carousel-track"
        id="carouselTrack"
        style={{
          transform:
            "translateX(-" +
            (index() % Math.max(1, props.slides.length)) * 100 +
            "%)",
        }}
        onTouchStart={(e) => {
          startX = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const delta = e.changedTouches[0].clientX - startX;
          if (Math.abs(delta) > 40)
            setIndex(
              (v) =>
                (v + (delta < 0 ? 1 : -1) + props.slides.length) %
                Math.max(1, props.slides.length),
            );
        }}
      >
        <For each={props.slides}>
          {(slide) => (
            <div class="carousel-slide">
              <div class="carousel-bg-blur">
                <img
                  src={image(slide)}
                  alt={slide.alt || ""}
                  class="bg-img"
                  loading="eager"
                  fetchpriority="high"
                />
              </div>
              <div class="carousel-content">
                <img
                  src={image(slide)}
                  alt={slide.alt || props.label}
                  class="main-img"
                  loading="eager"
                  fetchpriority="high"
                />
              </div>
            </div>
          )}
        </For>
      </div>
      <Show when={props.slides.length > 1}>
        <div class="carousel-dots">
          <For each={props.slides}>
            {(_, i) => (
              <button
                class={{
                  "carousel-dot": true,
                  active: index() % props.slides.length === i(),
                }}
                aria-label={"Go to slide " + (i() + 1)}
                onClick={() => setIndex(i())}
              />
            )}
          </For>
        </div>
      </Show>
    </>
  );
  return (
    <Show
      when={props.home}
      fallback={
        <div class="event-image-container" id="mediaContainer">
          {content}
        </div>
      }
    >
      <div id="home" class="carousel-wrapper full-bleed">
        <section class="carousel" style={{ padding: "0", "max-width": "100%" }}>
          {content}
        </section>
      </div>
    </Show>
  );
}
