import { createSignal } from 'solid-js';
export function useShare() {
  const [notice, setNotice] = createSignal('', { name: 'share-notice' });
  const share = async (title: string) => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); setNotice('Link copied to clipboard.'); }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setNotice('Could not share this link. Copy it from the address bar.');
    }
  };
  return { notice, share };
}
