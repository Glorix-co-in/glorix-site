import styles from "./Bookings.module.css";
import layout from "../../styles/site.module.css";
import PageTitle from "../../components/PageTitle";
import { useBookingsAnimations } from "../../lib/animations/bookings";
import { For } from "solid-js";
import { useBookings } from "../../bookings/useBookings";
import EventCard from "../../components/EventCard";
import ticker from "../../data/marquee.json";

export default function Page() {
  let root!: HTMLElement;
  useBookingsAnimations(() => root);
  const bookings = useBookings();
  return (
    <>
      <PageTitle title="Book Event Tickets" />

      <main
        ref={(element) => {
          root = element;
        }}
        id="main-content"
        class={layout.page}
      >
        <div
          class={[styles.hero, layout.fullBleed]}
          role="img"
          aria-label="Gradient banner"
          data-animate="bookings-hero"
        >
          <div class={styles.heroOverlay}>
            <h1 class={styles.heroTitle}>BOOK YOUR TICKETS NOW!</h1>
          </div>
        </div>

        <div
          class={[styles.ticker, layout.fullBleed]}
          data-animate="booking-ticker"
        >
          <div class={styles.tickerTrack} id="marqueeTrack">
            <For each={[0, 1]}>
              {() => (
                <div class={styles.tickerContent}>
                  <For each={[0, 1, 2, 3]}>
                    {() => (
                      <For each={ticker as { text: string }[]}>
                        {(item) => <span>{item.text}</span>}
                      </For>
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>
        </div>

        <section class={styles.events} data-animate="events">
          <h2 class={[layout.sectionTitle, styles.title]} data-animate="title">
            <span>UPCOMING</span> EVENTS
          </h2>
          <div
            class={styles.list}
            id="upcomingEventsContainer"
            data-animate="events-list"
          >
            <For
              each={bookings.upcoming()}
              fallback={
                <p class={styles.empty}>
                  No upcoming events at the moment. Stay tuned!
                </p>
              }
            >
              {(event) => <EventCard event={event} upcoming />}
            </For>
          </div>

          <h2
            class={[layout.sectionTitle, styles.title, styles.past]}
            data-animate="title"
          >
            <span>PAST</span> EVENTS
          </h2>
          <div
            class={styles.list}
            id="pastEventsContainer"
            data-animate="events-list"
          >
            <For each={bookings.past()}>
              {(event) => <EventCard event={event} upcoming={false} />}
            </For>
          </div>
        </section>
      </main>
    </>
  );
}
