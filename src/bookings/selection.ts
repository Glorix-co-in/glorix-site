import type { BookingOption } from "./types";

export interface SlotQuery {
  slot?: string | string[];
  date?: string | string[];
  time?: string | string[];
}

// The URL owns selection, including Back/Forward and links with multiple times.
export function selectedSlotDate(
  options: readonly BookingOption[],
  query: SlotQuery,
) {
  if (typeof query.slot === "string") {
    const linked = options.find(
      (option) => option.detailsEventId === query.slot,
    );
    if (linked) return linked.date;
  }
  return typeof query.date === "string" &&
    options.some((option) => option.date === query.date)
    ? query.date
    : undefined;
}

export function selectedSlotTime(
  options: readonly BookingOption[],
  query: SlotQuery,
  available: (option: BookingOption) => boolean,
) {
  const date = selectedSlotDate(options, query);
  const times = options.filter((option) => option.date === date);
  const explicit =
    typeof query.time === "string"
      ? times.find((option) => option.time === query.time)
      : undefined;
  const linked =
    typeof query.slot === "string"
      ? times.find((option) => option.detailsEventId === query.slot)
      : undefined;
  const selected =
    typeof query.time === "string"
      ? explicit
      : (linked ?? (times.length === 1 ? times[0] : undefined));
  return selected && available(selected) ? selected : undefined;
}

export function slotDateStatus(
  options: readonly BookingOption[],
  available: (option: BookingOption) => boolean,
) {
  const enabled = options.filter(available);
  if (enabled.length)
    return enabled.every((option) => option.status === "filling-fast")
      ? "filling-fast"
      : "available";
  return options.length &&
    options.every((option) => option.status === "sold-out")
    ? "sold-out"
    : "closed";
}
