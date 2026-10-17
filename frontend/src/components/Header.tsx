import styles from "./Header.module.css";
import { createEffect, createSignal, onSettled } from "solid-js";
import { useLocation } from "@solidjs/router";
import { useHeaderAnimations } from "../lib/animations/header";

export default function Header() {
  const [open, setOpen] = createSignal(false, { name: "navigation-open" });
  const location = useLocation();
  let root!: HTMLElement;
  useHeaderAnimations(
    () => root,
    () => location.pathname,
  );
  createEffect(
    () => location.pathname,
    () => {
      setOpen(false);
    },
    { name: "close-navigation-on-route" },
  );
  createEffect(
    open,
    (value) => {
      document.body.classList.toggle(styles.scrollLock, value);
      return () => document.body.classList.remove(styles.scrollLock);
    },
    { name: "navigation-scroll-lock" },
  );
  onSettled(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  });
  const home = () => location.pathname === "/";
  return (
    <header
      class={[
        styles.root,
        {
          [styles.entrance]: ["/", "/artists", "/team"].includes(
            location.pathname,
          ),
        },
      ]}
      ref={(element) => {
        root = element;
      }}
    >
      <div
        class={{ [styles.toggle]: true, [styles.active]: open() }}
        id="hamburger"
        role="button"
        tabindex="0"
        aria-label="Toggle navigation"
        aria-expanded={open() ? "true" : "false"}
        aria-controls="navMenu"
        onClick={() => setOpen(!open())}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open());
          }
        }}
      >
        <span />
        <span />
        <span />
      </div>
      <div class={styles.logo} data-animate="header-logo">
        <a href="/">
          <img
            src="/assets/cropped_logo.avif"
            alt="GLORIX Logo"
            height="100%"
            loading="eager"
            fetchpriority="high"
          />
        </a>
        <p>&nbsp;The X Factor In Everything !</p>
      </div>
      <nav
        class={{ [styles.navigation]: true, [styles.active]: open() }}
        id="navMenu"
        onClick={() => setOpen(false)}
        data-animate="header-navigation"
      >
        <ul>
          <li>
            <a
              href="/#home"
              class={{
                [styles.active]:
                  home() && (!location.hash || location.hash === "#home"),
              }}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href={home() ? "/#gallery" : "/gallery"}
              class={{
                [styles.active]:
                  location.pathname === "/gallery" ||
                  (home() && location.hash === "#gallery"),
              }}
            >
              Gallery
            </a>
          </li>
          <li>
            <a
              href="/bookings"
              class={{ [styles.active]: location.pathname === "/bookings" }}
            >
              Bookings
            </a>
          </li>
          <li>
            <a
              href="/artists"
              class={{ [styles.active]: location.pathname === "/artists" }}
            >
              Artists
            </a>
          </li>
          <li>
            <a
              href="/team"
              class={{ [styles.active]: location.pathname === "/team" }}
            >
              Team
            </a>
          </li>
          <li>
            <a
              href="/#email-subscription"
              class={{
                [styles.active]:
                  home() && location.hash === "#email-subscription",
              }}
            >
              Contact
            </a>
          </li>
        </ul>
      </nav>
      <a href="/bookings" class={styles.action} data-animate="header-action">
        Book Now
      </a>
    </header>
  );
}
