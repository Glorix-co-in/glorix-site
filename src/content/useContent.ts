import { ConvexClient } from "convex/browser";
import type { SiteContent } from "../../convex/validators";
import {
  createContext,
  createSignal,
  createStore,
  onCleanup,
  reconcile,
  useContext,
} from "solid-js";
import { api } from "../../convex/_generated/api";

export type { SiteContent };

export function createContent() {
  const url = import.meta.env.VITE_CONVEX_URL;
  const [state, setState] = createStore<SiteContent>(
    {
      events: [],
      artists: [],
      teams: [],
      gallery: [],
      carousel: [],
      collaborations: [],
      campaigns: [],
      marquee: [],
      testimonials: [],
      terms: [],
      seeded: false,
    },
    { name: "site-content" },
  );
  const [loaded, setLoaded] = createSignal(false, { name: "content-loaded" });
  const [error, setError] = createSignal<string | undefined>(
    url
      ? undefined
      : "Site content is unavailable. VITE_CONVEX_URL is not configured.",
    { name: "content-error" },
  );

  if (url) {
    const client = new ConvexClient(url, { disabled: import.meta.env.SSR });
    let controller: AbortController | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryDelay = 1000;
    let appliedVersion: string | undefined;

    const cancelPending = () => {
      controller?.abort();
      if (retryTimer !== undefined) clearTimeout(retryTimer);
    };

    const load = async (version: string) => {
      cancelPending();
      const request = new AbortController();
      controller = request;
      try {
        const response = await fetch(
          `/api/content?version=${encodeURIComponent(version)}`,
          {
            signal: request.signal,
          },
        );
        if (!response.ok)
          throw new Error(`Content request failed (${response.status}).`);
        const content: SiteContent = await response.json();
        if (request.signal.aborted) return;
        setState(reconcile(content, "_id"));
        appliedVersion = version;
        retryDelay = 1000;
        setLoaded(true);
        setError(undefined);
      } catch (cause) {
        if (request.signal.aborted) return;
        console.error("Unable to load published content", cause);
        setError("Unable to load site content. Retrying…");
        retryTimer = setTimeout(() => void load(version), retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30000);
      }
    };

    const unsubscribe = client.onUpdate(
      api.publishing.current,
      {},
      (version) => {
        cancelPending();
        if (!version) {
          setLoaded(false);
          setError("Site content has not been published yet.");
          return;
        }
        setError(undefined);
        retryDelay = 1000;
        if (version === appliedVersion) setLoaded(true);
        else void load(version);
      },
      (cause) => {
        console.error("Unable to load site content", cause);
        setError("Unable to load site content. Please refresh to try again.");
      },
    );
    onCleanup(() => {
      cancelPending();
      unsubscribe();
      void client.close();
    });
  }

  return { state, loaded, error };
}

export const ContentContext = createContext<SiteContent>();
export const useContent = () => useContext(ContentContext);
