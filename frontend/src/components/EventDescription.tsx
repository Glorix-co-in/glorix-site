import { createEffect, createSignal, onSettled } from "solid-js";

export default function EventDescription(props: { text?: string }) {
  const [expanded, setExpanded] = createSignal(false, {
    name: "about-expanded",
  });
  const [readMore, setReadMore] = createSignal(false, {
    name: "about-read-more",
  });
  let about!: HTMLParagraphElement;
  const measure = () => {
    const lineHeight = parseFloat(getComputedStyle(about).lineHeight);
    setReadMore(
      Number.isFinite(lineHeight) &&
        Math.round(about.scrollHeight / lineHeight) > 5,
    );
  };
  createEffect(
    () => props.text,
    () => {
      setExpanded(false);
      measure();
    },
    { name: "about-measure" },
  );
  onSettled(() => {
    let active = true;
    const observer = new ResizeObserver(measure);
    observer.observe(about);
    void document.fonts.ready.then(() => {
      if (active) measure();
    });
    return () => {
      active = false;
      observer.disconnect();
    };
  });
  return (
    <div class="about-section">
      <h2 class="about-title">About The Event</h2>
      <p
        class={{ "about-text": true, "is-collapsed": !expanded() }}
        id="aboutText"
        ref={(node) => {
          about = node;
        }}
      >
        {props.text}
      </p>
      <button
        type="button"
        class={{ "about-read-more": true, "is-visible": readMore() }}
        id="aboutReadMore"
        aria-expanded={expanded() ? "true" : "false"}
        aria-controls="aboutText"
        onClick={() => setExpanded(!expanded())}
      >
        {expanded() ? "READ LESS" : "READ MORE"}
      </button>
    </div>
  );
}
