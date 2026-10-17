import styles from "./EventFacts.module.css";
import type { EventDetailsView } from "../../bookings/eventDetails";

export default function EventFacts(props: {
  facts: EventDetailsView["facts"];
}) {
  return (
    <div class={styles.list}>
      <div class={styles.item} id="dateItem">
        <i class="far fa-calendar" />
        <span id="eventDate">{props.facts.date}</span>
      </div>
      <div class={styles.item} id="timeItem">
        <i class="far fa-clock" />
        <span id="eventTime">{props.facts.time}</span>
      </div>
      <div class={styles.item} id="durationItem">
        <i class="fas fa-hourglass-half" />
        <span id="eventDuration">{props.facts.duration}</span>
      </div>
      <div class={styles.item} id="ageItem">
        <i class="fas fa-users" />
        <span>
          Age Limit - <span id="eventAge">{props.facts.ageLimit}</span>
        </span>
      </div>
      <div class={styles.item} id="languageItem">
        <i class="fas fa-language" />
        <span id="eventLanguage">{props.facts.languages}</span>
      </div>
      <div class={styles.item} id="genreItem">
        <i class="fas fa-music" />
        <span id="eventGenre">{props.facts.genre}</span>
      </div>
      <div class={[styles.item, styles.venue]} id="venueItem">
        <i class="fas fa-location-dot" />
        <span id="eventVenue">{props.facts.venue}</span>
        <a
          href={props.facts.venueHref}
          id="venueLink"
          style={{ display: props.facts.showVenueLink ? undefined : "none" }}
          class={styles.directions}
          target="_blank"
          aria-label="Get directions"
        >
          <i class="fas fa-location-arrow" />
        </a>
      </div>
    </div>
  );
}
