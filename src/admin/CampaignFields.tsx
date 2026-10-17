import { For } from "solid-js";
import type { ContentData } from "../../shared/content";
import type { Doc } from "../../convex/_generated/dataModel";
import type { CollectionEditorState } from "./useCollectionEditor";
import { DateTimeField, TextField, ToggleField, Section } from "./EventFields";
import TagInput from "./TagInput";
import styles from "./Admin.module.css";

type Campaign = ContentData<"campaigns">;
type Slide = Campaign["effects"]["homePopup"];

function SlideFields(props: {
  label: string;
  value: Slide;
  events: Doc<"events">[];
  onChange: (patch: Partial<Slide>) => void;
}) {
  return (
    <>
      <TextField
        label={`${props.label} desktop image`}
        required
        value={props.value.desktopImage}
        onChange={(value) => props.onChange({ desktopImage: value })}
      />
      <TextField
        label={`${props.label} mobile image`}
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
    </>
  );
}

export default function CampaignFields(props: {
  value: Campaign;
  editor: CollectionEditorState;
  events: Doc<"events">[];
  isNew: boolean;
  disabled: boolean;
}) {
  return (
    <>
      <Section fieldsClass={styles.campaignFields}>
        <div class={[styles.wide, styles.campaignIdentity]}>
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
          <ToggleField
            label="Campaign enabled"
            checked={props.value.enabled}
            onChange={(value) =>
              props.editor.campaign((draft) => {
                draft.enabled = value;
              })
            }
          />
        </div>
        <DateTimeField
          label="Starts at"
          required
          value={props.value.startsAt}
          onChange={(value) =>
            props.editor.campaign((draft) => {
              draft.startsAt = value;
            })
          }
        />
        <DateTimeField
          label="Ends at"
          required
          value={props.value.endsAt}
          onChange={(value) =>
            props.editor.campaign((draft) => {
              draft.endsAt = value;
            })
          }
        />
        <TagInput
          label="Apply offer to events"
          wide
          disabled={props.disabled}
          value={props.value.eventIds}
          options={props.events.map((event) => ({
            value: event.id,
            label: `${event.title} · ${event.date}`,
            image: event.image,
          }))}
          placeholder="Search events…"
          onChange={(value) =>
            props.editor.campaign((draft) => {
              draft.eventIds = value;
            })
          }
        />
      </Section>
      <div class={styles.campaignPromotions}>
        <Section fieldsClass={styles.collectionFields}>
          <SlideFields
            label="Carousel"
            value={props.value.effects.homeCarousel}
            events={props.events}
            onChange={(patch) =>
              props.editor.campaign((draft) => {
                Object.assign(draft.effects.homeCarousel, patch);
              })
            }
          />
          <label class={styles.field}>
            <span>Carousel placement</span>
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
          <ToggleField
            label="Only while booking is open"
            checked={props.value.effects.homeCarousel.showWhenBookingOpen}
            onChange={(value) =>
              props.editor.campaign((draft) => {
                draft.effects.homeCarousel.showWhenBookingOpen = value;
              })
            }
          />
        </Section>
        <Section fieldsClass={styles.collectionFields}>
          <SlideFields
            label="Popup"
            value={props.value.effects.homePopup}
            events={props.events}
            onChange={(patch) =>
              props.editor.campaign((draft) => {
                Object.assign(draft.effects.homePopup, patch);
              })
            }
          />
          <ToggleField
            label="Only while booking is open"
            checked={props.value.effects.homePopup.showWhenBookingOpen}
            onChange={(value) =>
              props.editor.campaign((draft) => {
                draft.effects.homePopup.showWhenBookingOpen = value;
              })
            }
          />
          <small class={styles.hint}>
            Enable the linked event’s home announcement to show this popup.
          </small>
        </Section>
      </div>
    </>
  );
}
