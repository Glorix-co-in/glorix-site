import { createSignal, Show, type ParentProps } from "solid-js";
import {
  dateInputValue,
  dateLabel,
  timeInputValue,
  timeLabel,
  istInputValue,
  istTimestamp,
} from "./dateTime";
import styles from "./Admin.module.css";

export function TextField(props: {
  label: string;
  value?: string | number | null;
  onChange: (value: string) => void;
  type?: "text" | "url" | "number" | "date" | "time" | "datetime-local";
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
  hint?: string;
  min?: number;
  step?: string;
  max?: number;
  readOnly?: boolean;
  pattern?: string;
  wide?: boolean;
  rows?: number;
  class?: string;
}) {
  return (
    <label
      class={[
        styles.field,
        props.class,
        { [styles.wide]: props.wide ?? props.multiline },
      ]}
    >
      <span>{props.label}</span>
      <Show
        when={props.multiline}
        fallback={
          <input
            type={props.type ?? "text"}
            value={props.value ?? ""}
            required={props.required}
            placeholder={props.placeholder}
            min={props.min}
            max={props.max}
            readonly={props.readOnly}
            pattern={props.pattern}
            step={props.step}
            onInput={(event) => props.onChange(event.currentTarget.value)}
          />
        }
      >
        <textarea
          rows={props.rows ?? 4}
          value={props.value ?? ""}
          required={props.required}
          placeholder={props.placeholder}
          onInput={(event) => props.onChange(event.currentTarget.value)}
        />
      </Show>
      <Show when={props.hint}>
        <small>{props.hint}</small>
      </Show>
    </label>
  );
}

export function DateTimeField(props: {
  label: string;
  value?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      label={`${props.label} (IST)`}
      type="datetime-local"
      step="1"
      value={istInputValue(props.value)}
      required={props.required}
      onChange={(value) => props.onChange(istTimestamp(value))}
    />
  );
}

export function CalendarField(props: {
  label: string;
  value?: string | null;
  type?: "date" | "time";
  required?: boolean;
  onChange: (value: string) => void;
}) {
  const [custom, setCustom] = createSignal<boolean | undefined>(undefined, {
    name: "admin-custom-date-label",
  });
  const input = () =>
    props.type === "time"
      ? timeInputValue(props.value)
      : dateInputValue(props.value);
  const customLabel = () => custom() ?? Boolean(props.value && !input());
  return (
    <div class={styles.calendarField}>
      <TextField
        label={props.label}
        required={props.required}
        type={customLabel() ? "text" : (props.type ?? "date")}
        value={customLabel() ? props.value : input()}
        onChange={(value) =>
          props.onChange(
            customLabel()
              ? value
              : props.type === "time"
                ? timeLabel(value, props.value)
                : dateLabel(value),
          )
        }
      />
      <CheckField
        label="Custom display label"
        checked={customLabel()}
        onChange={(checked) => {
          setCustom(checked);
          if (!checked && props.value && !input()) props.onChange("");
        }}
      />
    </div>
  );
}

export function CheckField(props: {
  label: string;
  checked?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label class={styles.check}>
      <input
        type="checkbox"
        checked={Boolean(props.checked)}
        onChange={(event) => props.onChange(event.currentTarget.checked)}
      />
      <span>{props.label}</span>
    </label>
  );
}

export function ToggleField(props: {
  label: string;
  checked?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label class={styles.toggleField}>
      <input
        type="checkbox"
        role="switch"
        checked={Boolean(props.checked)}
        onChange={(event) => props.onChange(event.currentTarget.checked)}
      />
      <span class={styles.toggleTrack} aria-hidden="true">
        <span />
      </span>
      <span class={styles.toggleLabel}>{props.label}</span>
    </label>
  );
}

export function Section(
  props: ParentProps<{
    description?: string;
    fieldsClass?: string;
  }>,
) {
  return (
    <section class={styles.card}>
      <Show when={props.description}>
        <p class={styles.hint}>{props.description}</p>
      </Show>
      <div class={[styles.fields, props.fieldsClass]}>{props.children}</div>
    </section>
  );
}
