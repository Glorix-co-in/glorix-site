const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
const pad = (value: number) => String(value).padStart(2, "0");

// Parse only a single calendar date. A range or custom label must stay intact.
export function dateInputValue(value?: string | null): string {
  if (!value) return "";
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const label = /^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(\d{4})$/i.exec(
    value.trim(),
  );
  const year = Number(iso?.[1] ?? label?.[3]);
  const month = iso
    ? Number(iso[2]) - 1
    : months.indexOf(label?.[2].toLowerCase() ?? "");
  const day = Number(iso?.[3] ?? label?.[1]);
  const date = new Date(Date.UTC(year, month, day));
  if (
    year < 1000 ||
    month < 0 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day
  )
    return "";
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function dateLabel(value: string): string {
  const iso = dateInputValue(value);
  return iso
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${iso}T00:00:00Z`))
    : "";
}

const timePattern = /\b(\d{1,2}):(\d{2})(?:\s*(AM|PM))?\b/i;
export function timeInputValue(value?: string | null): string {
  const match = timePattern.exec(value ?? "");
  if (!match) return "";
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  if (minute > 59 || (match[3] ? hour < 1 || hour > 12 : hour > 23)) return "";
  if (match[3]) hour = (hour % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return `${pad(hour)}:${pad(minute)}`;
}

export function timeLabel(value: string, previous?: string | null): string {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return "";
  const hour = Number(value.slice(0, 2));
  const label = `${hour % 12 || 12}:${value.slice(3)} ${hour >= 12 ? "PM" : "AM"}`;
  return previous && timeInputValue(previous)
    ? previous.replace(timePattern, label)
    : label;
}

// The pickers always show IST, independent of the computer's timezone.
export function istInputValue(value?: string): string {
  if (!value || !Number.isFinite(Date.parse(value))) return "";
  return new Date(Date.parse(value) + 330 * 60_000).toISOString().slice(0, 19);
}

export function istTimestamp(value: string): string {
  return value ? `${value.length === 16 ? `${value}:00` : value}+05:30` : "";
}
