import { createEffect, createSignal, type Accessor } from "solid-js";

// A countdown owns its timer and stops it when the countdown is hidden.
export function useClock(enabled: Accessor<boolean> = () => true) {
  const [now, setNow] = createSignal(Date.now(), { name: "clock" });
  createEffect(
    enabled,
    (active) => {
      if (!active) return;
      const update = () => setNow(Date.now());
      update();
      const timer = setInterval(update, 1000);
      window.addEventListener("focus", update);
      return () => {
        clearInterval(timer);
        window.removeEventListener("focus", update);
      };
    },
    { name: "countdown-timer" },
  );
  return now;
}
