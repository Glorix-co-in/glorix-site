import { createSignal, onSettled } from 'solid-js';

// Time is an external input, not booking data. One clock is shared by the layout.
export function useClock() {
  const [now, setNow] = createSignal(Date.now(), { name: 'clock' });
  onSettled(() => {
    const update = () => setNow(Date.now());
    const timer = setInterval(update, 1000);
    window.addEventListener('focus', update);
    return () => { clearInterval(timer); window.removeEventListener('focus', update); };
  });
  return now;
}
