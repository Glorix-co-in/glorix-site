import { For, Show } from "solid-js";
import type { CollectionChange } from "../../shared/content";
import type { Doc } from "../../convex/_generated/dataModel";
import { collections, fieldValue, type Field } from "./collections";
import type { CollectionEditorState } from "./useCollectionEditor";
import { ToggleField, TextField, Section } from "./EventFields";
import CampaignFields from "./CampaignFields";
import styles from "./Admin.module.css";

function CollectionField(props: {
  field: Field;
  draft: CollectionChange;
  events: Doc<"events">[];
  editor: CollectionEditorState;
}) {
  const value = () => fieldValue(props.draft.data, props.field.key);
  return (
    <Show
      when={props.field.kind === "checkbox"}
      fallback={
        <Show
          when={props.field.kind === "event"}
          fallback={
            <TextField
              label={props.field.label}
              value={
                typeof value() === "boolean"
                  ? undefined
                  : (value() as string | number | undefined)
              }
              type={
                props.field.kind === "number"
                  ? "number"
                  : props.field.kind === "url"
                    ? "url"
                    : "text"
              }
              multiline={props.field.kind === "textarea"}
              required={props.field.required}
              hint={props.field.hint}
              placeholder={props.field.placeholder}
              rows={props.field.rows}
              wide={props.field.wide}
              min={props.field.min}
              max={props.field.max}
              step="1"
              onChange={(value) =>
                props.editor.field(
                  props.field.key,
                  props.field.kind === "number"
                    ? value === ""
                      ? undefined
                      : Number(value)
                    : value || (props.field.required ? "" : undefined),
                )
              }
            />
          }
        >
          <label class={styles.field}>
            <span>{props.field.label}</span>
            <select
              value={String(value() ?? "")}
              onChange={(event) =>
                props.editor.field(
                  props.field.key,
                  event.currentTarget.value || undefined,
                )
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
        </Show>
      }
    >
      <ToggleField
        label={props.field.label}
        checked={Boolean(value())}
        onChange={(checked) => props.editor.field(props.field.key, checked)}
      />
    </Show>
  );
}

export default function CollectionEditor(props: {
  draft: CollectionChange;
  editor: CollectionEditorState;
  events: Doc<"events">[];
  busy: boolean;
  onSave: (publish: boolean) => void;
}) {
  return (
    <form
      id="content-form"
      class={styles.editor}
      onSubmit={(event) => {
        event.preventDefault();
        props.onSave(false);
      }}
    >
      <fieldset class={styles.formFields} disabled={props.busy}>
        <Show
          when={props.draft.table === "campaigns" && props.draft.data}
          keyed
          fallback={
            <Section fieldsClass={styles.collectionFields}>
              <For each={collections[props.draft.table].fields}>
                {(field) => (
                  <CollectionField
                    field={field}
                    draft={props.draft}
                    events={props.events}
                    editor={props.editor}
                  />
                )}
              </For>
            </Section>
          }
        >
          {(campaign) => (
            <CampaignFields
              value={campaign}
              editor={props.editor}
              events={props.events}
              isNew={!props.draft.original}
              disabled={props.busy}
            />
          )}
        </Show>
      </fieldset>
    </form>
  );
}
