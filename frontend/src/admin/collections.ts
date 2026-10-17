import type {
  Collection,
  ContentData,
  ContentTable,
} from "../../shared/content";
import type { Doc } from "../../convex/_generated/dataModel";

export type FieldKind =
  "text" | "url" | "number" | "textarea" | "checkbox" | "event";
export interface Field {
  key: string;
  label: string;
  kind?: FieldKind;
  required?: boolean;
  hint?: string;
  min?: number;
  max?: number;
}
type Definition<K extends Collection> = {
  label: string;
  singular: string;
  description: string;
  fields: (Field & { key: Extract<keyof ContentData<K>, string> })[];
  blank: () => ContentData<K>;
};
const personFields = [
  { key: "name", label: "Name", required: true },
  { key: "image", label: "Image asset path", required: true },
  { key: "link", label: "Profile link" },
  { key: "role", label: "Role" },
  { key: "hidden", label: "Hide from the people page", kind: "checkbox" },
] as const;

export const collections = {
  artists: {
    label: "Artists",
    singular: "artist",
    description:
      "Renaming an artist also updates the names used by event lineups.",
    fields: [...personFields],
    blank: () => ({ name: "", image: "" }),
  },
  teams: {
    label: "Team",
    singular: "team member",
    description: "Manage the people shown on the team page.",
    fields: [...personFields],
    blank: () => ({ name: "", image: "", role: "" }),
  },
  gallery: {
    label: "Gallery",
    singular: "gallery image",
    description:
      "List order controls the gallery page. Home positions 1–11 control the home collage separately.",
    fields: [
      { key: "src", label: "Image asset path", required: true },
      { key: "alt", label: "Image description", required: true },
      {
        key: "homeOrder",
        label: "Home collage position",
        kind: "number",
        min: 1,
        max: 11,
        hint: "Leave empty to show this image only in the gallery.",
      },
      {
        key: "homeObjectPosition",
        label: "Home image crop position",
        hint: "For example: center, top, or 50% 30%.",
      },
    ],
    blank: () => ({ src: "", alt: "" }),
  },
  carousel: {
    label: "Home carousel",
    singular: "carousel slide",
    description:
      "Set the home slides, their order, and optional booking availability rules.",
    fields: [
      {
        key: "desktopImage",
        label: "Desktop image asset path",
        required: true,
      },
      { key: "mobileImage", label: "Mobile image asset path" },
      { key: "alt", label: "Image description", required: true },
      { key: "eventId", label: "Linked event", kind: "event" },
      {
        key: "showWhenBookingOpen",
        label: "Show only while the linked event can be booked",
        kind: "checkbox",
      },
    ],
    blank: () => ({ desktopImage: "", alt: "" }),
  },
  collaborations: {
    label: "Collaborations",
    singular: "collaboration",
    description: "Manage the names and logos in the collaboration strip.",
    fields: [
      { key: "name", label: "Name", required: true },
      { key: "logo", label: "Logo asset path", required: true },
    ],
    blank: () => ({ name: "", logo: "" }),
  },
  campaigns: {
    label: "Campaigns",
    singular: "campaign",
    description: "Manage timed offers, event targeting, and campaign imagery.",
    fields: [],
    blank: () => ({
      id: "",
      enabled: false,
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 86400000).toISOString(),
      eventIds: [],
      effects: {
        homeCarousel: { desktopImage: "", alt: "", position: "first" as const },
        homePopup: { desktopImage: "", alt: "" },
      },
    }),
  },
  marquee: {
    label: "Marquee",
    singular: "marquee message",
    description: "Messages shown in the ticker on the bookings page.",
    fields: [
      { key: "text", label: "Message", kind: "textarea", required: true },
    ],
    blank: () => ({ text: "" }),
  },
  testimonials: {
    label: "Testimonials",
    singular: "testimonial",
    description: "Manage the customer reviews shown on the home page.",
    fields: [
      { key: "name", label: "Name", required: true },
      { key: "role", label: "Role or location", required: true },
      { key: "image", label: "Portrait asset path", required: true },
      { key: "text", label: "Review", kind: "textarea", required: true },
    ],
    blank: () => ({ name: "", role: "", image: "", text: "" }),
  },
  terms: {
    label: "Terms & conditions",
    singular: "term",
    description: "Manage the terms shown in the event booking sheets.",
    fields: [{ key: "text", label: "Term", kind: "textarea", required: true }],
    blank: () => ({ text: "" }),
  },
} satisfies { [K in Collection]: Definition<K> };

export function recordTitle(record: Doc<ContentTable>) {
  for (const key of ["title", "name", "alt", "text", "id"] as const) {
    const value = Object.entries(record).find(([name]) => name === key)?.[1];
    if (typeof value === "string" && value) return value;
  }
  return "Untitled";
}
export function recordImage(record: Doc<ContentTable>) {
  for (const key of ["image", "src", "logo", "desktopImage"] as const) {
    const value = Object.entries(record).find(([name]) => name === key)?.[1];
    if (typeof value === "string") return value;
  }
}
export function fieldValue(data: ContentData<Collection>, key: string) {
  const value = Object.entries(data).find(([name]) => name === key)?.[1];
  return typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
    ? value
    : undefined;
}
