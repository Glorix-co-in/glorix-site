import type { Infer } from "convex/values";
import type { Doc } from "../convex/_generated/dataModel";
import type { contentValidators, SiteContent } from "../convex/validators";

export const collectionTables = [
  "artists",
  "teams",
  "gallery",
  "carousel",
  "collaborations",
  "campaigns",
  "marquee",
  "testimonials",
  "terms",
] as const;
export const contentTables = ["events", ...collectionTables] as const;
export const fallbackArtists = ["Saksham", "Nagity", "DJ Rick"];
export type Collection = (typeof collectionTables)[number];
export type ContentTable = (typeof contentTables)[number];
export type ContentData<K extends ContentTable = ContentTable> = Infer<
  (typeof contentValidators)[K]
>;
export type CollectionDocument = Doc<Collection>;
export type CollectionChange = {
  [K in Collection]: {
    table: K;
    original: Doc<K> | null;
    data: ContentData<K>;
  };
}[Collection];
export type RecordSelection = {
  [K in ContentTable]: { table: K; original: Doc<K> };
}[ContentTable];

export function recordData<K extends ContentTable>(
  document: Doc<K>,
): ContentData<K> {
  const { _id, _creationTime, position: _position, ...data } = document;
  return JSON.parse(JSON.stringify(data));
}

export function emptyContent(): SiteContent {
  return {
    events: [],
    artists: [],
    teams: [],
    gallery: [],
    carousel: [],
    collaborations: [],
    campaigns: [],
    marquee: [],
    testimonials: [],
    terms: [],
    seeded: false,
  };
}
