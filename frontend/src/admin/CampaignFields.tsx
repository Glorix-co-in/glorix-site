import { For } from "solid-js";
import type { ContentData } from "../../shared/content";
import type { Doc } from "../../convex/_generated/dataModel";
import type { CollectionEditorState } from "./useCollectionEditor";
import { TextField, CheckField, Section } from "./EventFields";
import styles from "./Admin.module.css";

type Campaign = ContentData<"campaigns">;
type Slide = Campaign["effects"]["homePopup"];

function SlideFields(props: {
  value: Slide;
  events: Doc<"events">[];
  onChange: (patch: Partial<Slide>) => void;
}) {
  return (
    <>
      <TextField
        label="Desktop image asset path"
        required
        value={props.value.desktopImage}
        onChange={(value) => props.onChange({ desktopImage: value })}
      />
      <TextField
        label="Mobile image asset path"
        value={props.value.mobileImage}
        onChange={(value) =>
          props.onChange({ mobileImage: value || undefined })
        }
      />
      <TextField
        label="Image description"
        required
        value={props.value.alt}
        onChange={(value) => props.onChange({ alt: value })}
      />
      <label class={styles.field}>
        <span>Linked event</span>
        <select
          value={props.value.eventId ?? ""}
          onChange={(event) =>
            props.onChange({ eventId: event.currentTarget.value || undefined })
          }
        >
          <option value="">No linked event</option>
          <For each={props.events}>
            {(event) => (
              <option value={event.id}>
                {event.title} · {event.date}
              </option>
            )}
          </For>
        </select>
      </label>
      <CheckField
        label="Show only when the linked event can be booked"
        checked={props.value.showWhenBookingOpen}
        onChange={(value) => props.onChange({ showWhenBookingOpen: value })}
      />
    </>
  );
}

export default function CampaignFields(props: {
  value: Campaign;
  editor: CollectionEditorState;
  events: Doc<"events">[];
  isNew: boolean;
}) {
  return (
    <>
      <Section
        title="Offer & schedule"
        description="Use timestamps with a timezone, for example 2026-10-17T18:00:00+05:30."
      >
        <TextField
          label="Campaign ID"
          required
          readOnly={!props.isNew}
          value={props.value.id}
          onChange={(value) =>
            props.editor.campaign((draft) => {
              draft.id = value;
            })
          }
        />
        <CheckField
          label="Enable this campaign"
          checked={props.value.enabled}
          onChange={(value) =>
            props.editor.campaign((draft) => {
              draft.enabled = value;
            })
          }
        />
        <TextField
          label="Starts at"
          required
          value={props.value.startsAt}
          onChange={(value) =>
            props.editor.campaign((draft) => {
              draft.startsAt = value;
            })
          }
        />
        <TextField
          label="Ends at"
          required
          value={props.value.endsAt}
          onChange={(value) =>
            props.editor.campaign((draft) => {
              draft.endsAt = value;
            })
          }
        />
        <TextField
          label="Offer starting price (₹)"
          type="number"
          min={0}
          step="any"
          value={props.value.effects.priceFrom}
          onChange={(value) =>
            props.editor.campaign((draft) => {
              draft.effects.priceFrom =
                value === "" ? undefined : Number(value);
            })
          }
        />
      </Section>
      <Section title="Apply offer to events">
        <div class={[styles.wide, styles.eventChoices]}>
          <For
            each={props.events}
            fallback={
              <p class={styles.hint}>
                Create an event before targeting an offer.
              </p>
            }
          >
            {(event) => (
              <CheckField
                label={`${event.title} · ${event.date}`}
                checked={props.value.eventIds.includes(event.id)}
                onChange={(checked) =>
                  props.editor.campaign((draft) => {
                    draft.eventIds = checked
                      ? [...new Set([...draft.eventIds, event.id])]
                      : draft.eventIds.filter((id) => id !== event.id);
                  })
                }
              />
            )}
          </For>
        </div>
      </Section>
      <Section title="Home carousel promotion">
        <label class={styles.field}>
          <span>Placement</span>
          <select
            value={props.value.effects.homeCarousel.position}
            onChange={(event) => {
              const value = event.currentTarget.value as "first" | "last";
              props.editor.campaign((draft) => {
                draft.effects.homeCarousel.position = value;
              });
            }}
          >
            <option value="first">Before regular slides</option>
            <option value="last">After regular slides</option>
          </select>
        </label>
        <SlideFields
          value={props.value.effects.homeCarousel}
          events={props.events}
          onChange={(patch) =>
            props.editor.campaign((draft) => {
              Object.assign(draft.effects.homeCarousel, patch);
            })
          }
        />
      </Section>
      <Section
        title="Popup promotion"
        description="Overrides the active campaign’s event announcement images. Enable the home announcement in that event to display it."
      >
        <SlideFields
          value={props.value.effects.homePopup}
          events={props.events}
          onChange={(patch) =>
            props.editor.campaign((draft) => {
              Object.assign(draft.effects.homePopup, patch);
            })
          }
        />
      </Section>
    </>
  );
}
