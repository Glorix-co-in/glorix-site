import styles from "./NavigationStatus.module.css";
import a11y from "../styles/accessibility.module.css";
import { Show } from "solid-js";
import { useIsRouting } from "@solidjs/router";

export default function NavigationStatus() {
  const pending = useIsRouting();
  return (
    <Show when={pending()}>
      <div class={styles.status} role="status">
        <span class={a11y.srOnly}>Loading page…</span>
      </div>
    </Show>
  );
}
