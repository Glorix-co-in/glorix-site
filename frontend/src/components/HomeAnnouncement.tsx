import "./styles/announcement.css";
import { createEffect, createMemo, createSignal, For } from "solid-js";
import { useBookings } from "../bookings/useBookings";
import { useClock } from "../lib/useClock";
import { eventHref } from "../bookings/rules";
export default function HomeAnnouncement() {
  const bookings = useBookings();
  const event = bookings.announcement;
  const [open, setOpen] = createSignal(false, { name: "announcement-open" });
  let dialog!: HTMLDialogElement;
  const now = useClock(open);
  const remaining = createMemo(
    () =>
      Math.max(
        0,
        Date.parse(event()?.details.eventStartsAtISO || "") - now(),
      ) || 0,
    { name: "announcement-countdown" },
  );
  createEffect(
    open,
    (value) => {
      if (value && !dialog.open) dialog.showModal();
      if (!value && dialog.open) dialog.close();
    },
    { name: "announcement-visibility" },
  );
  createEffect(
    event,
    (item) => {
      setOpen(false);
      if (!item || !bookings.canBook(item)) return;
      try {
        if (sessionStorage.getItem("announcement:" + item.id)) return;
        sessionStorage.setItem("announcement:" + item.id, "seen");
      } catch {}
      setOpen(true);
    },
    { name: "announcement-session" },
  );
  const view = createMemo(
    () => {
      const item = event();
      if (!item) return undefined;
      const [prefix, ...title] = item.title.split(/\s+/);
      const venues = (item.bookingOptions ?? []).map((option) => {
        const child = bookings.getEvent(option.detailsEventId);
        const match = option.date.match(/^(\d+)(?:st|nd|rd|th)?\s+([A-Za-z]+)/);
        const date = match
          ? match[1] + " " + match[2].slice(0, 3)
          : option.date;
        const address = (child?.details.venue ?? item.details.venue ?? "")
          .split(",")
          .map((part) => part.trim());
        const venue = (
          address.length > 2 ? address.slice(0, -1) : address
        ).join(", ");
        return date + ": " + venue;
      });
      return {
        prefix: prefix.toUpperCase(),
        title: title.join(" ").toUpperCase(),
        description:
          item.announcement?.description ??
          item.details.description ??
          item.details.aboutEvent,
        date: item.details.dateRange ?? item.date,
        time: Array.isArray(item.details.time)
          ? item.details.time.join(", ")
          : item.details.time,
        venues: venues.length ? venues : [item.details.venue ?? ""],
        desktopImage: "/" + (item.details.detailsImage?.portrait ?? item.image),
        mobileImage: "/" + (item.details.detailsImage?.landscape ?? item.image),
        href: eventHref(item),
        countdownLabel: item.announcement?.countdownLabel ?? "EVENT COUNTDOWN",
        countdownDescription:
          item.announcement?.countdownDescription ?? "Until the event begins",
      };
    },
    { name: "announcement-presentation" },
  );
  return (
    <dialog
      id="eventPopup"
      ref={(el) => {
        dialog = el;
      }}
      onClose={() => setOpen(false)}
      onCancel={() => setOpen(false)}
      class="event-popup"
      aria-labelledby="eventPopupTitle"
    >
      <div class="event-popup__content">
        <button
          class="event-popup__close"
          id="closeEventPopup"
          onClick={() => setOpen(false)}
          type="button"
          aria-label="Close event announcement"
        >
          <i class="fas fa-times" />
        </button>

        <div class="event-popup__left">
          <picture>
            <source srcset={view()?.mobileImage} media="(max-width: 640px)" />
            <img
              src={view()?.desktopImage}
              alt={event()?.title ?? ""}
              class="event-popup__image"
            />
          </picture>
        </div>

        <div class="event-popup__right">
          <h2 class="event-popup__title" id="eventPopupTitle">
            <span>{view()?.prefix}</span>
            <br />
            <span class="event-popup__title-highlight">{view()?.title}</span>
          </h2>

          <p class="event-popup__description">{view()?.description}</p>

          <div class="event-popup__meta">
            <div class="event-popup__meta-item">
              <i class="fas fa-calendar" />
              <div class="event-popup__meta-copy">
                <div class="event-popup__meta-label">{view()?.date}</div>
              </div>
              <div class="event-popup__meta-time">{view()?.time}</div>
            </div>

            <div class="event-popup__meta-item">
              <i class="fas fa-map-marker-alt" />
              <div class="event-popup__meta-copy">
                <div class="event-popup__meta-label">
                  <For each={view()?.venues}>
                    {(venue, index) => (
                      <>
                        {index() > 0 && <br />}
                        {venue}
                      </>
                    )}
                  </For>
                </div>
              </div>
            </div>

            <div class="event-popup__meta-item">
              <i class="fas fa-clock" />
              <div class="event-popup__meta-copy">
                <div class="event-popup__meta-label" id="bookingOpenLabel">
                  Starting price
                </div>
              </div>
              <div class="event-popup__meta-highlight" id="bookingOpenDate">
                {event() ? "₹" + bookings.price(event()!) : ""}
              </div>
            </div>
          </div>

          <div class="event-popup__countdown-container">
            <div class="event-popup__countdown-icon">
              <i class="fas fa-bolt" />
            </div>
            <div class="event-popup__countdown-copy">
              <div class="event-popup__countdown-label">
                {view()?.countdownLabel}
              </div>
              <div
                class="event-popup__countdown-label-sub"
                id="countdownLabelSub"
              >
                {view()?.countdownDescription}
              </div>
            </div>
            <div class="event-popup__countdown" id="eventCountdown">
              <div class="event-popup__countdown-item">
                <div class="event-popup__countdown-value" id="countdownDays">
                  {String(Math.floor(remaining() / 86400000)).padStart(2, "0")}
                </div>
                <div class="event-popup__countdown-label-small">DAYS</div>
              </div>
              <div class="event-popup__countdown-item">
                <div class="event-popup__countdown-value" id="countdownHours">
                  {String(Math.floor(remaining() / 3600000) % 24).padStart(
                    2,
                    "0",
                  )}
                </div>
                <div class="event-popup__countdown-label-small">HRS</div>
              </div>
              <div class="event-popup__countdown-item">
                <div class="event-popup__countdown-value" id="countdownMins">
                  {String(Math.floor(remaining() / 60000) % 60).padStart(
                    2,
                    "0",
                  )}
                </div>
                <div class="event-popup__countdown-label-small">MINS</div>
              </div>
              <div class="event-popup__countdown-item">
                <div class="event-popup__countdown-value" id="countdownSecs">
                  {String(Math.floor(remaining() / 1000) % 60).padStart(2, "0")}
                </div>
                <div class="event-popup__countdown-label-small">SECS</div>
              </div>
            </div>
          </div>

          <div class="event-popup__buttons">
            <a
              href={view()?.href}
              id="eventPopupBookBtn"
              class="event-popup__btn event-popup__btn--primary"
            >
              <span id="eventPopupBookBtnText">BOOK NOW</span>
              <i class="fas fa-arrow-right" />
            </a>
          </div>
        </div>
      </div>
    </dialog>
  );
}
