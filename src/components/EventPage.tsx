import styles from "./EventPage.module.css";
import { createSignal, For, Show } from "solid-js";
import { useEventDetails } from "../bookings/useEventDetails";
import MediaCarousel from "./MediaCarousel";
import PageTitle from "./PageTitle";
import NotFound from "./NotFound";
import EventHeader from "./EventHeader";
import EventDescription from "./EventDescription";
import EventFacts from "./events/EventFacts";
import EventArtists from "./events/EventArtists";
import BookingBar from "./events/BookingBar";
import EventSheets, { type EventSheet } from "./events/EventSheets";

export default function EventPage(props: { id?: string }) {
  const details = useEventDetails(() => props.id);
  const [modal, setModal] = createSignal<EventSheet>(null, {
    name: "event-modal",
  });

  return (
    <Show
      when={details.view()}
      fallback={<NotFound message="Event not found" />}
    >
      {(view) => (
        <>
          <PageTitle title={view().title} />
          <EventHeader title={view().title} />
          <main id="main-content" class={styles.page}>
            <MediaCarousel slides={view().slides} label={view().title} />
            <div class={styles.content}>
              <div class={styles.scroll}>
                <div class={styles.tags} id="eventTags">
                  <For each={view().tags}>
                    {(tag) => <span class={styles.tag}>{tag}</span>}
                  </For>
                </div>
                <EventFacts facts={view().facts} />
                <EventDescription text={view().description} />
                <EventArtists
                  artists={view().artists}
                  visible={view().showArtists}
                />
                <button
                  type="button"
                  class={styles.sheetButton}
                  id="stageLayoutSection"
                  aria-haspopup="dialog"
                  style={{ display: view().stageImage ? "flex" : "none" }}
                  onClick={() => setModal("stage")}
                >
                  <span class={styles.sheetLabel}>Stage Layout</span>
                  <i class="fas fa-chevron-right" />
                </button>
                <button
                  type="button"
                  class={styles.sheetButton}
                  id="termsSection"
                  aria-haspopup="dialog"
                  onClick={() => setModal("terms")}
                >
                  <span class={styles.sheetLabel}>Terms & Conditions</span>
                  <i class="fas fa-chevron-right" />
                </button>
              </div>
              <BookingBar booking={view().booking} onBook={details.book} />
            </div>
          </main>
          <EventSheets
            active={modal()}
            stageImage={view().stageImage}
            onClose={() => setModal(null)}
          />
        </>
      )}
    </Show>
  );
}
