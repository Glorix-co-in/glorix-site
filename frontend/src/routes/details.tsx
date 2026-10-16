import { useSearchParams } from "@solidjs/router";
import EventPage from "../components/EventPage";
// Query-string entry retained for links copied from the original HTML pages.
export default function Details() {
  const [search] = useSearchParams();
  return (
    <EventPage id={typeof search.id === "string" ? search.id : undefined} />
  );
}
