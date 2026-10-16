import { createEffect, createSignal, type Accessor } from "solid-js";

// Update time-dependent data only when one of its timestamps is crossed.
// A countdown can independently use useClock without refiltering every list.
export function useBoundaryClock(boundaries: Accessor<number[]>) {
  const [now, setNow] = createSignal(Date.now(), {
    name: "booking-boundary-time",
  });
  createEffect(
    boundaries,
    (times) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const update = () => {
        if (timer) clearTimeout(timer);
        const current = Date.now();
        setNow(current);
        const next = times.find((time) => time > current);
        if (next !== undefined)
          timer = setTimeout(
            update,
            Math.max(1, Math.min(next - current, 2_147_483_647)),
          );
      };
      update();
      window.addEventListener("focus", update);
      return () => {
        if (timer) clearTimeout(timer);
        window.removeEventListener("focus", update);
      };
    },
    { name: "booking-boundary-schedule" },
  );
  return now;
}
