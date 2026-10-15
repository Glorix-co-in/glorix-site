import { createSignal, onSettled } from 'solid-js';
export function useMediaQuery(query: string) {
  const [matches, setMatches] = createSignal(typeof window !== 'undefined' && window.matchMedia(query).matches, { name: 'media-query' });
  onSettled(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  });
  return matches;
}
