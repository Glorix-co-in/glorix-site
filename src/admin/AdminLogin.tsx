import { createSignal, Show } from "solid-js";
import type { useAdminContent } from "./useAdminContent";
import styles from "./Admin.module.css";

export default function AdminLogin(props: {
  admin: ReturnType<typeof useAdminContent>;
}) {
  const [password, setPassword] = createSignal("", {
    name: "admin-password-input",
  });
  return (
    <div class={styles.loginLayout}>
      <section class={styles.loginCard}>
        <p class={styles.eyebrow}>GLORIX ADMIN</p>
        <h1>
          Your content.
          <br />
          <span>Your stage.</span>
        </h1>
        <p class={styles.hint}>
          Manage your site content and publish changes when you’re ready.
        </p>
        <Show
          when={props.admin.configured()}
          fallback={
            <p class={styles.error}>
              Admin sign-in is not configured. Complete the server setup before
              signing in.
            </p>
          }
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void props.admin.login(password()).then((signedIn) => {
                if (signedIn) setPassword("");
              });
            }}
          >
            <label class={styles.field}>
              <span>Admin password</span>
              <input
                type="password"
                autocomplete="current-password"
                required
                maxlength={1024}
                value={password()}
                onInput={(event) => setPassword(event.currentTarget.value)}
                disabled={Boolean(props.admin.pending())}
              />
            </label>
            <button
              class={styles.primary}
              type="submit"
              disabled={Boolean(props.admin.pending())}
            >
              {props.admin.pending() === "login" ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </Show>
      </section>
    </div>
  );
}
