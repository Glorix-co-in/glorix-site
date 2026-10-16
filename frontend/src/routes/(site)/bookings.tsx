import PageTitle from "../../components/PageTitle";
import { useOriginalAnimations } from "../../lib/useOriginalAnimations";
import { For } from "solid-js";
import { useBookings } from "../../bookings/useBookings";
import EventCard from "../../components/EventCard";
import ticker from "../../data/marquee.json";
import "../../components/styles/event-card.css";
import "../../styles/pages/bookings.css";

export default function Page() {
  useOriginalAnimations("bookings");
  const bookings = useBookings();
  return (
    <>
      <PageTitle title="Book Event Tickets" />

      <main id="main-content" class="main-content bookings-page">
        <div
          class="bookings-hero full-bleed"
          role="img"
          aria-label="Gradient banner"
        >
          <div class="bookings-hero__overlay">
            <h1 class="bookings-hero__title">BOOK YOUR TICKETS NOW!</h1>
          </div>
        </div>

        <div class="offer-ticker full-bleed">
          <div class="offer-ticker__track" id="marqueeTrack">
            <For each={[0, 1]}>
              {() => (
                <div class="offer-ticker__content">
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

        <section class="events-section">
          <h2 class="section-title">
            <span>UPCOMING</span> EVENTS
          </h2>
          <div class="events-container" id="upcomingEventsContainer">
            <For
              each={bookings.upcoming()}
              fallback={
                <p
                  style={{
                    color: "#666",
                    "text-align": "center",
                    "grid-column": "1/-1",
                    padding: "40px",
                  }}
                >
                  No upcoming events at the moment. Stay tuned!
                </p>
              }
            >
              {(event) => <EventCard event={event} upcoming />}
            </For>
          </div>

          <h2 class="section-title past-title">
            <span>PAST</span> EVENTS
          </h2>
          <div class="events-container" id="pastEventsContainer">
            <For each={bookings.past()}>
              {(event) => <EventCard event={event} upcoming={false} />}
            </For>
          </div>
        </section>
      </main>
    </>
  );
}
