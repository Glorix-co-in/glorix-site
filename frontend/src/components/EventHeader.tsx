import { useNavigate } from "@solidjs/router";
import { useShare } from "../lib/useShare";

export default function EventHeader(props: { title: string; slots?: boolean }) {
  const navigate = useNavigate();
  const share = useShare();
  const back = () =>
    window.history.length > 1 ? window.history.back() : navigate("/bookings");
  return (
    <>
      <header class={props.slots ? "select-slot-header" : "details-header"}>
        <button
          type="button"
          class="back-btn"
          id="backBtn"
          aria-label="Go back"
          onClick={back}
        >
          <i class="fas fa-chevron-left" />
        </button>
        <h1 class="header-title" id="headerTitle">
          {props.title}
        </h1>
        <button
          type="button"
          class="share-btn"
          id="shareBtn"
          aria-label="Share event"
          onClick={() => share.share(props.title)}
        >
          <i class="fas fa-share-alt" />
        </button>
      </header>
      <span class="sr-only" role="status">
        {share.notice()}
      </span>
    </>
  );
}
