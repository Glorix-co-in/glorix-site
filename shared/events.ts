import type { Doc } from "../convex/_generated/dataModel";
import type { BookingEvent } from "../src/bookings/types";

export function eventData(document: Doc<"events">): BookingEvent {
  const { _id, _creationTime, position: _position, ...event } = document;
  return JSON.parse(JSON.stringify(event));
}

export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`)
      .join(",")}}`;
  return JSON.stringify(value) ?? "null";
}
