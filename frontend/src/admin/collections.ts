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
  placeholder?: string;
  rows?: number;
  wide?: boolean;
  min?: number;
  max?: number;
}
type Definition<K extends Collection> = {
  label: string;
  singular: string;
  fields: (Field & { key: Extract<keyof ContentData<K>, string> })[];
  blank: () => ContentData<K>;
};
const profileFields = [
  { key: "name", label: "Name", required: true },
  { key: "image", label: "Image asset path", required: true },
  { key: "link", label: "Profile link" },
] as const;
const visibilityField = {
  key: "hidden",
  kind: "checkbox",
} as const;

export const collections = {
  artists: {
    label: "Artists",
    singular: "artist",
    fields: [
      ...profileFields,
      { ...visibilityField, label: "Hide from artists page" },
    ],
    blank: () => ({ name: "", image: "" }),
  },
  teams: {
    label: "Team",
    singular: "team member",
    fields: [
      profileFields[0],
      { key: "role", label: "Role" },
      profileFields[1],
      profileFields[2],
      { ...visibilityField, label: "Hide from team page" },
    ],
    blank: () => ({ name: "", image: "", role: "" }),
  },
  gallery: {
    label: "Gallery",
    singular: "gallery image",
    fields: [
      { key: "src", label: "Image asset path", required: true },
      { key: "alt", label: "Image description", required: true },
      {
        key: "homeOrder",
        label: "Home collage position (1–11)",
        kind: "number",
        min: 1,
        max: 11,
        placeholder: "Gallery only",
      },
      {
        key: "homeObjectPosition",
        label: "Home image crop position",
        placeholder: "center, top, or 50% 30%",
      },
    ],
    blank: () => ({ src: "", alt: "" }),
  },
  carousel: {
    label: "Home carousel",
    singular: "carousel slide",
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
        label: "Only show while booking is open",
        kind: "checkbox",
      },
    ],
    blank: () => ({ desktopImage: "", alt: "" }),
  },
  collaborations: {
    label: "Collaborations",
    singular: "collaboration",
    fields: [
      { key: "name", label: "Name", required: true },
      { key: "logo", label: "Logo asset path", required: true },
    ],
    blank: () => ({ name: "", logo: "" }),
  },
  campaigns: {
    label: "Campaigns",
    singular: "campaign",
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
    fields: [
      {
        key: "text",
        label: "Message",
        kind: "textarea",
        required: true,
        rows: 2,
      },
    ],
    blank: () => ({ text: "" }),
  },
  testimonials: {
    label: "Testimonials",
    singular: "testimonial",
    fields: [
      { key: "name", label: "Name", required: true },
      { key: "role", label: "Role or location", required: true },
      {
        key: "image",
        label: "Portrait asset path",
        required: true,
        wide: true,
      },
      {
        key: "text",
        label: "Review",
        kind: "textarea",
        required: true,
        rows: 3,
      },
    ],
    blank: () => ({ name: "", role: "", image: "", text: "" }),
  },
  terms: {
    label: "Terms & conditions",
    singular: "term",
    fields: [
      { key: "text", label: "Term", kind: "textarea", required: true, rows: 3 },
    ],
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
