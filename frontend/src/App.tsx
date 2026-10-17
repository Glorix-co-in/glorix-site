import styles from "./App.module.css";
import "./styles/tokens.css";
import "./styles/base.css";
import { Loading, Show, type ParentProps } from "solid-js";
import { Router } from "./router";
import { BookingsContext, createBookings } from "./bookings/useBookings";
import NavigationStatus from "./components/NavigationStatus";
import { ContentContext, createContent } from "./content/useContent";
function AppRoot(props: ParentProps) {
  const content = createContent();
  const bookings = createBookings(content.state);
  return (
    <BookingsContext value={bookings}>
      <a class={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <NavigationStatus />
      <ContentContext value={content.state}>
        <Show
          when={content.loaded() && content.state.seeded}
          fallback={
            <main id="main-content">
              <p role={content.error() ? "alert" : "status"}>
                {content.error() ||
                  (content.loaded()
                    ? "Site content has not been set up yet."
                    : "Loading page…")}
              </p>
            </main>
          }
        >
          <Loading
            fallback={
              <main id="main-content">
                <p role="status">Loading page…</p>
              </main>
            }
          >
            {props.children}
          </Loading>
        </Show>
      </ContentContext>
    </BookingsContext>
  );
}
export default function App() {
  return <Router>{(props) => <AppRoot>{props.children}</AppRoot>}</Router>;
}
