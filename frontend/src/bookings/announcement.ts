import type { BookingEvent } from "./types";
import { announcementDate, eventMedia, eventPrice } from "./formatters";
import { eventHref, isSoldOut } from "./rules";

function announcementVenue(address: string) {
  const parts = address.split(",").map((part) => part.trim());
  // The upstream address ends with the city; the popup shows the venue and area.
  return (parts.length > 2 ? parts.slice(0, -1) : parts).join(", ");
}

export function toAnnouncementView(
  event: BookingEvent,
  getEvent: (id?: string) => BookingEvent | undefined,
  price: number | undefined,
) {
  // The original popup styles the first title word separately.
  const [prefix, ...title] = event.title.split(/\s+/);
  const media = eventMedia(event);
  const soldOut = isSoldOut(event);
  const venues = (event.bookingOptions ?? []).map((option) => {
    const child = getEvent(option.detailsEventId);
    const venue = announcementVenue(
      child?.details.venue ?? event.details.venue ?? "",
    );
    return announcementDate(option.date) + ": " + venue;
  });
  return {
    prefix: prefix.toUpperCase(),
    title: title.join(" ").toUpperCase(),
    imageAlt: event.title,
    description:
      event.announcement?.description ??
      event.details.description ??
      event.details.aboutEvent,
    date: event.details.dateRange ?? event.date,
    time: Array.isArray(event.details.time)
      ? event.details.time.join(", ")
      : event.details.time,
    venues: venues.length ? venues : [event.details.venue ?? ""],
    desktopImage: "/" + media.desktopImage,
    mobileImage: "/" + media.mobileImage,
    priceLabel: eventPrice(price).label,
    href: eventHref(event),
    buttonLabel: soldOut ? "SOLD OUT" : "BOOK NOW",
    disabled: soldOut,
    countdownLabel: event.announcement?.countdownLabel ?? "EVENT COUNTDOWN",
    countdownDescription:
      event.announcement?.countdownDescription ?? "Until the event begins",
  };
}
