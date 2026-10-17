import { createMemo, type Accessor } from "solid-js";
import { useNavigate } from "@solidjs/router";
import artists from "../data/artists.json";
import { toEventDetails } from "./eventDetails";
import { useBookings } from "./useBookings";

export function useEventDetails(id: Accessor<string | undefined>) {
  const bookings = useBookings();
  const navigate = useNavigate();
  const event = createMemo(() => bookings.getEvent(id()), {
    name: "event-details",
  });
  const view = createMemo(
    () => {
      const item = event();
      if (!item) return undefined;
      return toEventDetails(item, artists, {
        canBook: bookings.canBook(item),
        hasOpened: bookings.hasOpened(item),
        price: bookings.price(item),
      });
    },
    { name: "event-details-presentation" },
  );

  const book = () => {
    const item = event();
    if (!item || !bookings.canBook(item)) return;
    if (item.bookingOptions?.length)
      navigate("/events/" + encodeURIComponent(item.id) + "/slots");
    else {
      const url = bookings.bookingUrl(item);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return { view, book };
}
