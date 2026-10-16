import { useSearchParams } from "@solidjs/router";
import EventPage from "../components/EventPage";
// Preserve query-string links from the original site.
export default function Details() {
  const [search] = useSearchParams();
  return (
    <EventPage id={typeof search.id === "string" ? search.id : undefined} />
  );
}
