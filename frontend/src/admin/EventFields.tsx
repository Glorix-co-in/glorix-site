import { Show, type ParentProps } from "solid-js";
import styles from "./Admin.module.css";

export function TextField(props: {
  label: string;
  value?: string | number | null;
  onChange: (value: string) => void;
  type?: "text" | "url" | "number";
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
  hint?: string;
  min?: number;
  step?: string;
  max?: number;
  readOnly?: boolean;
  pattern?: string;
}) {
  return (
    <label class={[styles.field, { [styles.wide]: props.multiline }]}>
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
          rows={4}
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

export function Section(
  props: ParentProps<{ title: string; description?: string }>,
) {
  return (
    <section class={styles.card}>
      <h3>{props.title}</h3>
      <Show when={props.description}>
        <p class={styles.hint}>{props.description}</p>
      </Show>
      <div class={styles.fields}>{props.children}</div>
    </section>
  );
}
