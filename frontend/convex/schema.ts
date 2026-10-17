import { defineSchema, defineTable } from "convex/server";
import { v, type PropertyValidators } from "convex/values";
import { contentValidators as content, siteContent } from "./validators";

const ordered = <T extends PropertyValidators>(fields: T) =>
  defineTable({ ...fields, position: v.number() }).index("by_position", [
    "position",
  ]);

export default defineSchema({
  events: ordered(content.events.fields).index("by_event_id", ["id"]),
  artists: ordered(content.artists.fields),
  teams: ordered(content.teams.fields),
  gallery: ordered(content.gallery.fields),
  carousel: ordered(content.carousel.fields),
  collaborations: ordered(content.collaborations.fields),
  campaigns: ordered(content.campaigns.fields),
  marquee: ordered(content.marquee.fields),
  testimonials: ordered(content.testimonials.fields),
  terms: ordered(content.terms.fields),
  publications: defineTable({ content: siteContent, publishedAt: v.number() }),
  publicationState: defineTable({
    key: v.literal("site"),
    version: v.id("publications"),
    draftBaseline: v.optional(siteContent),
  }).index("by_key", ["key"]),
  adminLoginAttempts: defineTable({
    key: v.string(),
    startedAt: v.number(),
    attempts: v.number(),
  }).index("by_key", ["key"]),
  seeds: defineTable({ key: v.string(), completedAt: v.number() }).index(
    "by_key",
    ["key"],
  ),
});
