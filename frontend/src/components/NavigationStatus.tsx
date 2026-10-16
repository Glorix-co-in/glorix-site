import { Show } from "solid-js";
import { useIsRouting } from "@solidjs/router";

export default function NavigationStatus() {
  const pending = useIsRouting();
  return (
    <Show when={pending()}>
      <div class="navigation-status" role="status">
        Loading page…
      </div>
    </Show>
  );
}
