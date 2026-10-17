import styles from "./Admin.module.css";

export default function EditorActions(props: {
  dirty: boolean;
  busy: boolean;
  saving: boolean;
  onReset: () => void;
}) {
  return (
    <div class={styles.saveBar}>
      <span class={{ [styles.unsaved]: props.dirty }}>
        {props.dirty ? "Unsaved changes" : "All changes saved"}
      </span>
      <div class={styles.actions}>
        <button
          class={styles.textButton}
          type="button"
          disabled={props.busy || !props.dirty}
          onClick={() => props.onReset()}
        >
          Discard changes
        </button>
        <button
          class={styles.secondary}
          type="submit"
          value="draft"
          disabled={props.busy || !props.dirty}
        >
          {props.saving ? "Saving…" : "Save draft"}
        </button>
        <button
          class={styles.primary}
          type="submit"
          value="publish"
          disabled={props.busy || !props.dirty}
        >
          {props.saving ? "Saving…" : "Save & publish"}
        </button>
      </div>
    </div>
  );
}
