import { createEffect, createSignal, type Accessor } from "solid-js";
export function useMediaQuery(query: string | Accessor<string>) {
  const [matches, setMatches] = createSignal(false, { name: "media-query" });
  createEffect(
    () => (typeof query === "function" ? query() : query),
    (value) => {
      const media = window.matchMedia(value);
      const update = () => setMatches(media.matches);
      update();
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    },
    { name: "media-query-listener" },
  );
  return matches;
}
