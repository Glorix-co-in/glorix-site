import { createMemo, For, Match, Show, Switch } from "solid-js";
import { useLocation } from "@solidjs/router";
import Header from "./Header";
import Footer from "./Footer";
import a11y from "../styles/accessibility.module.css";
import styles from "./LoadingShell.module.css";

function Block(props: { class?: string }) {
  return <span class={[styles.block, props.class]} />;
}

function Copy() {
  return (
    <div class={styles.copy}>
      <Block />
      <Block />
      <Block class={styles.short} />
    </div>
  );
}

export default function LoadingShell(props: { error?: string }) {
  const location = useLocation();
  const kind = createMemo(
    () => {
      const path = location.pathname.replace(/\/$/, "") || "/";
      if (path === "/") return "home";
      if (path === "/bookings") return "bookings";
      if (path === "/gallery") return "gallery";
      if (path === "/artists" || path === "/team") return path.slice(1);
      if (/\/slots$/.test(path) || /^\/select-slot(?:\.html)?$/.test(path))
        return "slots";
      if (/^\/events\/[^/]+$/.test(path) || /^\/details(?:\.html)?$/.test(path))
        return "details";
      return "gallery";
    },
    { name: "loading-shell-route" },
  );
  const eventPage = () => kind() === "details" || kind() === "slots";
  return (
    <div class={[styles.shell, { [styles.eventShell]: eventPage() }]}>
      <Show when={eventPage()} fallback={<Header animate={false} />}>
        <header class={styles.eventHeader} aria-hidden="true">
          <Block class={styles.circle} />
          <Block class={styles.heading} />
          <Block class={styles.circle} />
        </header>
      </Show>
      <main id="main-content" aria-busy={!props.error}>
        <Show
          when={props.error}
          fallback={
            <>
              <span class={a11y.srOnly} role="status">
                Loading page content…
              </span>
              <div aria-hidden="true">
                <Switch>
                  <Match when={kind() === "home"}>
                    <div class={styles.hero}>
                      <Block class={styles.heroImage} />
                    </div>
                    <div class={styles.join}>
                      <Block class={styles.short} />
                    </div>
                    <div class={styles.about}>
                      <div class={styles.stats}>
                        <Block />
                        <Block />
                      </div>
                      <div class={styles.aboutCopy}>
                        <Block class={styles.heading} />
                        <Copy />
                      </div>
                      <div class={styles.stats}>
                        <Block />
                        <Block />
                      </div>
                    </div>
                  </Match>
                  <Match when={kind() === "bookings"}>
                    <div class={styles.banner}>
                      <Block class={styles.heading} />
                    </div>
                    <div class={styles.bookings}>
                      <Block class={styles.sectionTitle} />
                      <div class={styles.featured}>
                        <Block class={styles.featuredImage} />
                        <Copy />
                        <Block class={styles.button} />
                      </div>
                      <Block class={styles.sectionTitle} />
                      <div class={styles.bookingGrid}>
                        <For each={[0, 1, 2, 3]}>
                          {() => (
                            <div class={styles.bookingCard}>
                              <Block class={styles.poster} />
                              <Copy />
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  </Match>
                  <Match when={kind() === "details"}>
                    <div class={styles.details}>
                      <Block class={styles.detailPoster} />
                      <div class={styles.detailContent}>
                        <div class={styles.tags}>
                          <For each={[0, 1, 2]}>{() => <Block />}</For>
                        </div>
                        <div class={styles.facts}>
                          <For each={[0, 1, 2, 3, 4, 5]}>{() => <Block />}</For>
                        </div>
                        <Block class={styles.heading} />
                        <Copy />
                        <Copy />
                        <div class={styles.bookingBar}>
                          <Block class={styles.short} />
                          <Block class={styles.button} />
                        </div>
                      </div>
                    </div>
                  </Match>
                  <Match when={kind() === "slots"}>
                    <div class={styles.slots}>
                      <Block class={styles.stepper} />
                      <div class={styles.slotEvent}>
                        <Block class={styles.thumbnail} />
                        <Copy />
                      </div>
                      <div class={styles.slotSelection}>
                        <Block class={styles.heading} />
                        <div class={styles.tags}>
                          <Block />
                          <Block />
                        </div>
                        <Block class={styles.heading} />
                        <div class={styles.tags}>
                          <Block />
                          <Block />
                        </div>
                      </div>
                      <Block class={styles.button} />
                    </div>
                  </Match>
                  <Match when={["gallery", "artists", "team"].includes(kind())}>
                    <div class={styles.collection}>
                      <Block class={styles.sectionTitle} />
                      <Show when={kind() !== "gallery"}>
                        <Block class={styles.intro} />
                      </Show>
                      <div
                        class={[
                          styles.grid,
                          {
                            [styles.artists]: kind() === "artists",
                            [styles.people]: kind() !== "gallery",
                          },
                        ]}
                      >
                        <For
                          each={Array.from(
                            { length: kind() === "artists" ? 10 : 8 },
                            (_, i) => i,
                          )}
                        >
                          {() => (
                            <div class={styles.tile}>
                              <Block class={styles.tileImage} />
                              <Show when={kind() !== "gallery"}>
                                <Block class={styles.name} />
                              </Show>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  </Match>
                </Switch>
              </div>
            </>
          }
        >
          {(error) => (
            <p class={styles.error} role="alert">
              {error()}
            </p>
          )}
        </Show>
      </main>
      <Show when={!eventPage()}>
        <Footer />
      </Show>
    </div>
  );
}
