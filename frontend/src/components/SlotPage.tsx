import styles from "./SlotPage.module.css";
import { createMemo, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useBookings } from "../bookings/useBookings";
import { safeExternalUrl } from "../bookings/rules";
import { useSlotSelection } from "../bookings/useSlotSelection";
import { slotDate } from "../bookings/formatters";
import EventHeader from "./EventHeader";
import PageTitle from "./PageTitle";
import NotFound from "./NotFound";
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
            <main class={styles.page} id="main-content">
              <div class={styles.stepper}>
                <div class={[styles.step, styles.active]}>
                  <span class={styles.stepNumber}>1</span>
                  <span>Date &amp; Time</span>
                </div>
                <i class={["fas", "fa-chevron-right", styles.separator]} />
                <div class={styles.step}>
                  <span class={styles.stepNumber}>2</span>
                  <span>Payment</span>
                </div>
                <i class={["fas", "fa-chevron-right", styles.separator]} />
                <div class={styles.step}>
                  <span class={styles.stepNumber}>3</span>
                  <span>Ticket</span>
                </div>
              </div>
              <div class={styles.event}>
                <img
                  src={"/" + item().image}
                  alt={item().title}
                  id="eventThumb"
                  class={styles.image}
                />
                <div class={styles.eventText}>
                  <h2 id="eventTitle">{item().title}</h2>
                  <p id="eventVenue">{item().details.venue}</p>
                </div>
              </div>
              <div class={styles.legend}>
                <div class={styles.legendItem}>
                  <span class={[styles.dot, styles.available]} /> Available
                </div>
                <div class={styles.legendItem}>
                  <span class={[styles.dot, styles["filling-fast"]]} /> Filling
                  Fast
                </div>
                <div class={styles.legendItem}>
                  <span class={[styles.dot, styles["sold-out"]]} /> Sold out
                </div>
              </div>
              <div class={styles.selection}>
                <Show
                  when={selection.availability().showSlots}
                  fallback={
                    <p class={styles.notice}>
                      {selection.availability().notice}
                    </p>
                  }
                >
                  <div class={styles.options}>
                    <section class={styles.section} id="dateSection">
                      <h3 class={styles.title}>Select Date</h3>
                      <div class={styles.grid} id="dateSlots">
                        <For each={dates()}>
                          {(date) => (
                            <button
                              type="button"
                              class={[
                                styles.slot,
                                styles[dateStatus(date)],
                                { [styles.selected]: selectedDate() === date },
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
                              <span class={styles.date}>{slotDate(date)}</span>
                            </button>
                          )}
                        </For>
                      </div>
                    </section>
                    <section
                      class={styles.section}
                      id="timeSection"
                      style={{ display: selectedDate() ? undefined : "none" }}
                    >
                      <h3 class={styles.title}>Select Time</h3>
                      <div class={styles.grid} id="timeSlots">
                        <For each={times()}>
                          {(option) => (
                            <button
                              type="button"
                              class={[
                                styles.slot,
                                styles[option.status],
                                {
                                  [styles.closed]: !available(option),
                                  [styles.selected]: selectedTime() === option,
                                },
                              ]}
                              aria-pressed={
                                selectedTime() === option ? "true" : "false"
                              }
                              disabled={!available(option)}
                              onClick={() => selection.selectTime(option)}
                            >
                              <span class={styles.time}>
                                {option.time || "Time TBA"}
                              </span>
                              <Show when={!available(option)}>
                                <span class={styles.status}>
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
              <div class={styles.bar}>
                <button
                  class={styles.confirm}
                  id="confirmBtn"
                  disabled={selection.availability().disabled}
                  onClick={confirm}
                >
                  {selection.availability().buttonLabel}
                </button>
              </div>
            </main>
          </>
        )}
      </Show>
    </>
  );
}
