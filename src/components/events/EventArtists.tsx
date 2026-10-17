import typography from "./typography.module.css";
import styles from "./EventArtists.module.css";
import { For } from "solid-js";
import type { EventDetailsView } from "../../bookings/eventDetails";

export default function EventArtists(props: {
  artists: EventDetailsView["artists"];
  visible: boolean;
}) {
  return (
    <div
      class={styles.section}
      id="artistsSection"
      style={{ display: props.visible ? "block" : "none" }}
    >
      <h2 class={typography.sectionTitle}>Featured Artists</h2>
      <div class={styles.carousel}>
        <div class={styles.grid} id="eventArtists">
          <For each={props.artists}>
            {(artist) => (
              <a
                href={artist.link || "#"}
                class={styles.card}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div
                  class={{
                    [styles.image]: true,
                    [styles.featured]: artist.featured,
                  }}
                >
                  <img
                    src={"/" + artist.image}
                    alt={artist.name}
                    loading="lazy"
                  />
                </div>
                <span class={styles.name}>{artist.name}</span>
              </a>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
