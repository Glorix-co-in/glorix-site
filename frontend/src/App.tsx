import styles from "./App.module.css";
import "./styles/tokens.css";
import "./styles/base.css";
import { Loading, type ParentProps } from "solid-js";
import { Router } from "./router";
import { BookingsContext, createBookings } from "./bookings/useBookings";
import NavigationStatus from "./components/NavigationStatus";
function AppRoot(props: ParentProps) {
  const bookings = createBookings();
  return (
    <BookingsContext value={bookings}>
      <a class={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <NavigationStatus />
      <Loading
        fallback={
          <main id="main-content">
            <p role="status">Loading page…</p>
          </main>
        }
      >
        {props.children}
      </Loading>
    </BookingsContext>
  );
}
export default function App() {
  return <Router>{(props) => <AppRoot>{props.children}</AppRoot>}</Router>;
}
