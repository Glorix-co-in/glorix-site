import styles from "./announcement/Announcement.module.css";
import { createMemo, For } from "solid-js";
import { useBookings } from "../bookings/useBookings";
import { toAnnouncementView } from "../bookings/announcement";
import { useAnnouncementDialog } from "./announcement/useAnnouncementDialog";
import AnnouncementCountdown from "./announcement/AnnouncementCountdown";

export default function HomeAnnouncement() {
  const bookings = useBookings();
  const event = bookings.announcement;
  const dialog = useAnnouncementDialog(event);
  const view = createMemo(
    () => {
      const item = event();
      if (!item) return undefined;
      return toAnnouncementView(item, bookings.getEvent, bookings.price(item));
    },
    { name: "announcement-presentation" },
  );
  return (
    <dialog
      id="eventPopup"
      ref={dialog.ref}
      onClose={dialog.close}
      onCancel={dialog.close}
      class={styles.dialog}
      aria-labelledby="eventPopupTitle"
    >
      <div class={styles.content}>
        <button
          class={styles.close}
          id="closeEventPopup"
          onClick={dialog.close}
          type="button"
          aria-label="Close event announcement"
        >
          <i class="fas fa-times" />
        </button>

        <div class={styles.left}>
          <picture>
            <source srcset={view()?.mobileImage} media="(max-width: 640px)" />
            <img
              src={view()?.desktopImage}
              alt={view()?.imageAlt ?? ""}
              class={styles.image}
            />
          </picture>
        </div>

        <div class={styles.right}>
          <h2 class={styles.title} id="eventPopupTitle">
            <span>{view()?.prefix}</span>
            <br />
            <span class={styles.titleHighlight}>{view()?.title}</span>
          </h2>

          <p class={styles.description}>{view()?.description}</p>

          <div class={styles.meta}>
            <div class={styles.metaItem}>
              <i class="fas fa-calendar" />
              <div class={styles.metaCopy}>
                <div class={styles.metaLabel}>{view()?.date}</div>
              </div>
              <div class={styles.metaTime}>{view()?.time}</div>
            </div>

            <div class={styles.metaItem}>
              <i class="fas fa-map-marker-alt" />
              <div class={styles.metaCopy}>
                <div class={styles.metaLabel}>
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

            <div class={styles.metaItem}>
              <i class="fas fa-clock" />
              <div class={styles.metaCopy}>
                <div class={styles.metaLabel} id="bookingOpenLabel">
                  Starting price
                </div>
              </div>
              <div class={styles.metaHighlight} id="bookingOpenDate">
                {view()?.priceLabel}
              </div>
            </div>
          </div>

          <div class={styles.countdownContainer}>
            <div class={styles.countdownIcon}>
              <i class="fas fa-bolt" />
            </div>
            <div>
              <div class={styles.countdownLabel}>{view()?.countdownLabel}</div>
              <div class={styles.countdownLabelSub} id="countdownLabelSub">
                {view()?.countdownDescription}
              </div>
            </div>
            <AnnouncementCountdown
              startsAt={event()?.details.eventStartsAtISO}
              enabled={dialog.open()}
            />
          </div>

          <div class={styles.buttons}>
            <a
              href={view()?.disabled ? undefined : view()?.href}
              id="eventPopupBookBtn"
              class={{
                [styles.btn]: true,
                [styles.primary]: true,
                [styles.disabled]: view()?.disabled,
              }}
              aria-disabled={view()?.disabled ? "true" : undefined}
              tabindex={view()?.disabled ? -1 : undefined}
            >
              <span id="eventPopupBookBtnText">{view()?.buttonLabel}</span>
              <i class="fas fa-arrow-right" />
            </a>
          </div>
        </div>
      </div>
    </dialog>
  );
}
