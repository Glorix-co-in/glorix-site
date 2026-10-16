import { createMemo, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useBookings } from "../bookings/useBookings";
import { safeExternalUrl } from "../bookings/rules";
import { useSlotSelection } from "../bookings/useSlotSelection";
import EventHeader from "./EventHeader";
import "../styles/controls.css";
import PageTitle from "./PageTitle";
import NotFound from "./NotFound";
import "../styles/pages/slot-selection.css";
export default function SlotPage(props: { id?: string }) {
  const bookings = useBookings();
  const navigate = useNavigate();
  const event = createMemo(() => bookings.getEvent(props.id), {
    name: "slot-event",
  });
  const selection = useSlotSelection(event);
  const {
    dates,
    date: selectedDate,
    times,
    time: selectedTime,
    available,
    dateStatus,
    selectDate,
  } = selection;
  const formatDate = (date: string) => {
    const d = new Date(date.replace(/(\d+)(st|nd|rd|th)/, "$1"));
    return Number.isFinite(d.getTime())
      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()] +
          " " +
          String(d.getDate()).padStart(2, "0") +
          " " +
          [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ][d.getMonth()]
      : date;
  };
  const confirm = () => {
    const option = selectedTime();
    if (!option || !available(option)) return;
    if (option.detailsEventId)
      navigate("/events/" + encodeURIComponent(option.detailsEventId));
    else {
      const url = safeExternalUrl(option.link);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    }
  };
  return (
    <>
      <Show when={event()} fallback={<NotFound message="Event not found" />}>
        {(item) => (
          <>
            <PageTitle title={item().title} />
            <EventHeader title={item().title} slots />
            <main
              class="select-slot-main slot-selection-page"
              id="main-content"
            >
              <div class="stepper">
                <div class="step active">
                  <span class="step-num">1</span>
                  <span class="step-label">Date &amp; Time</span>
                </div>
                <i class="fas fa-chevron-right step-sep" />
                <div class="step">
                  <span class="step-num">2</span>
                  <span class="step-label">Payment</span>
                </div>
                <i class="fas fa-chevron-right step-sep" />
                <div class="step">
                  <span class="step-num">3</span>
                  <span class="step-label">Ticket</span>
                </div>
              </div>
              <div class="event-mini-info">
                <img
                  src={"/" + item().image}
                  alt={item().title}
                  id="eventThumb"
                  class="event-thumb"
                />
                <div class="event-text">
                  <h2 id="eventTitle">{item().title}</h2>
                  <p id="eventVenue">{item().details.venue}</p>
                </div>
              </div>
              <div class="legend-container">
                <div class="legend-item">
                  <span class="dot available" /> Available
                </div>
                <div class="legend-item">
                  <span class="dot filling-fast" /> Filling Fast
                </div>
                <div class="legend-item">
                  <span class="dot sold-out" /> Sold out
                </div>
              </div>
              <div class="selection-card">
                <Show
                  when={bookings.canBook(item())}
                  fallback={
                    <p class="booking-opening-notice">
                      {bookings.hasOpened(item())
                        ? "Bookings are closed for this event."
                        : "Bookings open " +
                          item().details.bookingOpensAtISO +
                          " IST."}
                    </p>
                  }
                >
                  <div class="selection-container">
                    <section class="selection-section" id="dateSection">
                      <h3 class="section-title">Select Date</h3>
                      <div class="slots-grid" id="dateSlots">
                        <For each={dates()}>
                          {(date) => (
                            <button
                              type="button"
                              class={[
                                "slot-card",
                                dateStatus(date),
                                { selected: selectedDate() === date },
                              ]}
                              aria-pressed={
                                selectedDate() === date ? "true" : "false"
                              }
                              disabled={
                                dateStatus(date) === "closed" ||
                                dateStatus(date) === "sold-out"
                              }
                              onClick={() => selectDate(date)}
                            >
                              <span class="slot-date-full">
                                {formatDate(date)}
                              </span>
                            </button>
                          )}
                        </For>
                      </div>
                    </section>
                    <section
                      class="selection-section"
                      id="timeSection"
                      style={{ display: selectedDate() ? undefined : "none" }}
                    >
                      <h3 class="section-title">Select Time</h3>
                      <div class="slots-grid" id="timeSlots">
                        <For each={times()}>
                          {(option) => (
                            <button
                              type="button"
                              class={[
                                "slot-card",
                                option.status,
                                {
                                  closed: !available(option),
                                  selected: selectedTime() === option,
                                },
                              ]}
                              aria-pressed={
                                selectedTime() === option ? "true" : "false"
                              }
                              disabled={!available(option)}
                              onClick={() => selection.selectTime(option)}
                            >
                              <span class="slot-time">
                                {option.time || "Time TBA"}
                              </span>
                              <Show when={!available(option)}>
                                <span class="slot-status">
                                  {option.status === "sold-out"
                                    ? "Sold Out"
                                    : "Unavailable"}
                                </span>
                              </Show>
                            </button>
                          )}
                        </For>
                      </div>
                    </section>
                  </div>
                </Show>
              </div>
              <div class="sticky-bottom-bar">
                <button
                  class="confirm-btn"
                  id="confirmBtn"
                  disabled={!selectedTime() || !bookings.canBook(item())}
                  onClick={confirm}
                >
                  Continue to Booking
                </button>
              </div>
            </main>
          </>
        )}
      </Show>
    </>
  );
}
