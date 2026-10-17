import type { BookingEvent } from "./types";

const openingDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "Asia/Kolkata",
});
const openingTime = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

export function formatBookingOpening(value?: string) {
  const timestamp = Date.parse(value ?? "");
  if (!Number.isFinite(timestamp)) return undefined;
  return `${openingDate.format(timestamp)}, ${openingTime.format(timestamp).toUpperCase()}`;
}

export function eventMedia(event: BookingEvent) {
  return {
    desktopImage: event.details.detailsImage?.portrait || event.image,
    mobileImage: event.details.detailsImage?.landscape || event.image,
  };
}

export function eventPrice(price: number | undefined) {
  const free = price === 0;
  return {
    value: free ? "Free Entry" : (price ?? "TBA"),
    showCurrency: !free,
    showSuffix: !free,
    label: free ? "Free Entry" : price === undefined ? "TBA" : "₹" + price,
  };
}

export function shortEventDate(date: string) {
  const match = date.match(
    /(\d+(?:st|nd|rd|th)(?:\s*(?:&|-)?\s*\d+(?:st|nd|rd|th))?)\s+([A-Za-z]+)/,
  );
  return match ? match[1] + " " + match[2].slice(0, 3) : date;
}

export function announcementDate(date: string) {
  const match = date.match(/^(\d+)(?:st|nd|rd|th)?\s+([A-Za-z]+)/);
  return match ? match[1] + " " + match[2].slice(0, 3) : date;
}

export function slotDate(date: string) {
  const parsed = new Date(date.replace(/(\d+)(st|nd|rd|th)/, "$1"));
  if (!Number.isFinite(parsed.getTime())) return date;
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    parsed.getDay()
  ];
  const month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][parsed.getMonth()];
  return (
    weekday + " " + String(parsed.getDate()).padStart(2, "0") + " " + month
  );
}
