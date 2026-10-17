import styles from "./BookingBar.module.css";
import type { EventDetailsView } from "../../bookings/eventDetails";

export default function BookingBar(props: {
  booking: EventDetailsView["booking"];
  onBook: () => void;
}) {
  return (
    <div class={styles.bar}>
      <div class={styles.priceInfo}>
        <span class={styles.price}>
          <span
            style={{
              display: props.booking.price.showCurrency ? undefined : "none",
            }}
          >
            ₹
          </span>
          <span id="priceFrom">{props.booking.price.value}</span>
          <span
            style={{
              display: props.booking.price.showSuffix ? undefined : "none",
            }}
          >
            {" "}
            onwards
          </span>
        </span>
        <span
          class={[styles.availability, styles[props.booking.tone]]}
          id="availability"
        >
          {props.booking.label}
        </span>
      </div>
      <div class={styles.action}>
        <button
          class={styles.button}
          id="bookNowBtn"
          disabled={!props.booking.canBook}
          onClick={() => props.onBook()}
        >
          {props.booking.buttonLabel}
        </button>
      </div>
    </div>
  );
}
