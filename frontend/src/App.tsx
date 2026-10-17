import styles from "./App.module.css";
import "./styles/tokens.css";
import "./styles/base.css";
import { Loading, Show, type ParentProps } from "solid-js";
import { Router } from "./router";
import { BookingsContext, createBookings } from "./bookings/useBookings";
import NavigationStatus from "./components/NavigationStatus";
import { ContentContext, createContent } from "./content/useContent";
import { useLocation } from "@solidjs/router";
function PublicContent(props: ParentProps) {
  const content = createContent();
  const bookings = createBookings(content.state);
  return (
    <BookingsContext value={bookings}>
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
function AppRoot(props: ParentProps) {
  const location = useLocation();
  return (
    <>
      <a class={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <NavigationStatus />
      <Show
        when={location.pathname.replace(/\/$/, "") === "/admin"}
        fallback={<PublicContent>{props.children}</PublicContent>}
      >
        {props.children}
      </Show>
    </>
  );
}
export default function App() {
  return <Router>{(props) => <AppRoot>{props.children}</AppRoot>}</Router>;
}
