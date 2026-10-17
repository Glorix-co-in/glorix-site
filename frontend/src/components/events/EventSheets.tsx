import styles from "./EventSheets.module.css";
import { For } from "solid-js";
import BottomSheet from "../BottomSheet";
import { useContent } from "../../content/useContent";

export type EventSheet = "terms" | "stage" | null;

export default function EventSheets(props: {
  active: EventSheet;
  stageImage?: string;
  onClose: () => void;
}) {
  const content = useContent();
  return (
    <>
      <BottomSheet
        id="termsModal"
        title="Terms & Conditions"
        closeId="closeTerms"
        open={props.active === "terms"}
        onClose={props.onClose}
        footer={
          <button
            type="button"
            class={styles.confirm}
            id="gotItBtn"
            onClick={() => props.onClose()}
          >
            Okay, Got It
          </button>
        }
      >
        <ol class={styles.terms}>
          <For each={content.terms}>{(term) => <li>{term.text}</li>}</For>
        </ol>
      </BottomSheet>
      <BottomSheet
        id="stageLayoutModal"
        title="Stage Layout"
        closeId="closeStageLayout"
        tall
        open={props.active === "stage"}
        onClose={props.onClose}
      >
        <img
          id="stageLayoutImage"
          class={styles.stageImage}
          src={props.stageImage}
          alt="Stage Layout"
          loading="lazy"
        />
      </BottomSheet>
    </>
  );
}
