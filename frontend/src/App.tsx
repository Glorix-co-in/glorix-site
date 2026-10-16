import { Loading, Show, type ParentProps } from "solid-js";
import { useLocation } from "@solidjs/router";
import { Router } from "./router";
import { BookingsContext, createBookings } from "./bookings/useBookings";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MusicPlayer from "./components/MusicPlayer";
import NavigationStatus from "./components/NavigationStatus";
import "./styles/base.css";
import "./App.css";
function SiteLayout(props: ParentProps) {
  const bookings = createBookings();
  const location = useLocation();
  const eventPage = () =>
    location.pathname.startsWith("/events/") ||
    location.pathname === "/details" ||
    location.pathname === "/select-slot";
  return (
    <BookingsContext value={bookings}>
      <a class="skip-link" href="#main-content">
        Skip to content
      </a>
      <NavigationStatus />
      <Show when={!eventPage()}>
        <Header />
      </Show>
      <Loading
        fallback={
          <main id="main-content">
            <p role="status">Loading page…</p>
          </main>
        }
      >
        {props.children}
      </Loading>
      <Show when={!eventPage()}>
        <Footer />
        <MusicPlayer />
      </Show>
    </BookingsContext>
  );
}
export default function App() {
  return (
    <Router>{(props) => <SiteLayout>{props.children}</SiteLayout>}</Router>
  );
}
