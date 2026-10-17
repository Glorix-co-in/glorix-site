import styles from "./EventHeader.module.css";
import a11y from "../styles/accessibility.module.css";
import { useNavigate } from "@solidjs/router";
import { useShare } from "../lib/useShare";

export default function EventHeader(props: { title: string; slots?: boolean }) {
  const navigate = useNavigate();
  const share = useShare();
  const back = () =>
    window.history.length > 1 ? window.history.back() : navigate("/bookings");
  return (
    <>
      <header
        class={[styles.header, props.slots ? styles.slots : styles.details]}
      >
        <button
          type="button"
          class={styles.back}
          id="backBtn"
          aria-label="Go back"
          onClick={back}
        >
          <i class="fas fa-chevron-left" />
        </button>
        <h1 class={styles.title} id="headerTitle">
          {props.title}
        </h1>
        <button
          type="button"
          class={styles.share}
          id="shareBtn"
          aria-label="Share event"
          onClick={() => share.share(props.title)}
        >
          <i class="fas fa-share-alt" />
        </button>
      </header>
      <span class={a11y.srOnly} role="status">
        {share.notice()}
      </span>
    </>
  );
}
