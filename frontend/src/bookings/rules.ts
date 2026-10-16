import type { BookingEvent, BookingOption, BookingStatus } from "./types";

const active = new Set<BookingStatus>([
  "open",
  "available",
  "filling-fast",
  "sold-out",
  "soon",
]);
export const timestamp = (value?: string) => (value ? Date.parse(value) : NaN);
export function hasBookingEnded(event: BookingEvent, now: number) {
  const end = timestamp(event.details.bookingEndsAtISO);
  return Number.isFinite(end) && now >= end;
}
export function hasBookingOpened(event: BookingEvent, now: number) {
  return (
    !event.details.bookingOpensAtISO ||
    now >= timestamp(event.details.bookingOpensAtISO)
  );
}
export function isVisible(event: BookingEvent, now: number) {
  return (
    !event.hiddenFromBookings &&
    event.status !== "hidden" &&
    hasBookingOpened(event, now)
  );
}
export function isUpcoming(event: BookingEvent, now: number) {
  return active.has(event.status) && !hasBookingEnded(event, now);
}
export function canBook(event: BookingEvent, now: number) {
  return (
    isUpcoming(event, now) &&
    event.status !== "sold-out" &&
    hasBookingOpened(event, now)
  );
}
export function safeExternalUrl(value?: string | null) {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}
export function bookingUrl(event: BookingEvent, now: number) {
  return canBook(event, now) ? safeExternalUrl(event.bookingLink) : undefined;
}
export function eventDate(event: BookingEvent) {
  const start = timestamp(event.details.eventStartsAtISO);
  if (Number.isFinite(start)) return start;
  const date = event.date
    .replace(/(\d+)(st|nd|rd|th)/g, "$1")
    .replace(/(\d+)\s*(?:&|-)\s*\d+/, "$1");
  return Date.parse(date) || 0;
}
export function eventHref(event: BookingEvent) {
  const base = "/events/" + encodeURIComponent(event.id);
  return event.bookingFlow === "date-first" ? base + "/slots" : base;
}
export function slotAvailable(
  option: BookingOption,
  events: readonly BookingEvent[],
  now: number,
) {
  if (option.status === "closed" || option.status === "sold-out") return false;
  if (option.detailsEventId) {
    const child = events.find((event) => event.id === option.detailsEventId);
    return Boolean(child && canBook(child, now));
  }
  return Boolean(safeExternalUrl(option.link));
}
