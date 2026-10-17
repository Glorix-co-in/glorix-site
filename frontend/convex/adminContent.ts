import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { contentValidators, siteContent } from "./validators";
import { readContent } from "./content";
import { publishContent } from "./publishing";
import { authorize, conflict, invalid } from "./lib/admin";
import { canonical } from "../shared/events";
import {
  contentTables,
  fallbackArtists,
  type Collection,
  type CollectionChange,
  type RecordSelection,
} from "../shared/content";

const changeFor = <K extends Collection>(table: K) =>
  v.object({
    table: v.literal(table),
    original: v.union(siteContent.fields[table].element, v.null()),
    data: contentValidators[table],
  });
const change = v.union(
  changeFor("artists"),
  changeFor("teams"),
  changeFor("gallery"),
  changeFor("carousel"),
  changeFor("collaborations"),
  changeFor("campaigns"),
  changeFor("marquee"),
  changeFor("testimonials"),
  changeFor("terms"),
);
const selectionFor = <K extends (typeof contentTables)[number]>(table: K) =>
  v.object({
    table: v.literal(table),
    original: siteContent.fields[table].element,
  });
const selection = v.union(
  selectionFor("events"),
  selectionFor("artists"),
  selectionFor("teams"),
  selectionFor("gallery"),
  selectionFor("carousel"),
  selectionFor("collaborations"),
  selectionFor("campaigns"),
  selectionFor("marquee"),
  selectionFor("testimonials"),
  selectionFor("terms"),
);
const table = v.union(
  v.literal("artists"),
  v.literal("teams"),
  v.literal("gallery"),
  v.literal("carousel"),
  v.literal("collaborations"),
  v.literal("campaigns"),
  v.literal("marquee"),
  v.literal("testimonials"),
  v.literal("terms"),
);

export const get = query({
  args: { secret: v.string() },
  returns: v.object({
    content: siteContent,
    draftCounts: v.record(v.string(), v.number()),
    draftCount: v.number(),
    publishedAt: v.union(v.number(), v.null()),
  }),
  handler: async (ctx, { secret }) => {
    authorize(secret);
    const content = await readContent(ctx);
    const state = await ctx.db
      .query("publicationState")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    const published = state
      ? await ctx.db.get("publications", state.version)
      : null;
    const draftCounts: Record<string, number> = {};
    for (const table of contentTables) {
      const previous = new Map<string, unknown>(
        published?.content[table].map((row) => [row._id, row]) ?? [],
      );
      const currentIds = new Set<string>(content[table].map((row) => row._id));
      draftCounts[table] =
        content[table].filter(
          (row) => canonical(row) !== canonical(previous.get(row._id)),
        ).length +
        [...previous.keys()].filter((id) => !currentIds.has(id)).length;
    }
    return {
      content,
      draftCounts,
      draftCount: Object.values(draftCounts).reduce(
        (sum, value) => sum + value,
        0,
      ),
      publishedAt: published?.publishedAt ?? null,
    };
  },
});

function required(value: string, label: string) {
  if (!value.trim()) invalid(`${label} is required.`);
}
function link(value: string | undefined) {
  if (!value || value === "#") return;
  try {
    if (!["http:", "https:"].includes(new URL(value).protocol))
      invalid("Links must start with https:// or http://.");
  } catch {
    invalid("Links must start with https:// or http://.");
  }
}
function timestamp(value: string) {
  if (
    !Number.isFinite(Date.parse(value)) ||
    !/(Z|[+-]\d{2}:\d{2})$/i.test(value)
  )
    invalid("Enter a valid timestamp including its timezone.");
}
async function eventExists(
  ctx: MutationCtx,
  id: string | undefined,
  requiredLink = false,
) {
  if (!id) {
    if (requiredLink) invalid("Choose the event linked to this content.");
    return;
  }
  if (
    !(await ctx.db
      .query("events")
      .withIndex("by_event_id", (q) => q.eq("id", id))
      .unique())
  )
    invalid(`The linked event '${id}' was not found.`);
}

async function validate(ctx: MutationCtx, change: CollectionChange) {
  switch (change.table) {
    case "artists":
    case "teams": {
      required(change.data.name, "Name");
      required(change.data.image, "Image");
      link(change.data.link);
      if (
        change.table === "artists" &&
        (!change.original || change.original.name !== change.data.name)
      ) {
        if (
          (await ctx.db.query("artists").collect()).some(
            (artist) =>
              artist._id !== change.original?._id &&
              artist.name === change.data.name,
          )
        )
          invalid("An artist with this name already exists.");
      }
      break;
    }
    case "gallery": {
      required(change.data.src, "Image");
      required(change.data.alt, "Image description");
      const order = change.data.homeOrder;
      if (order !== undefined) {
        if (!Number.isInteger(order) || order < 1 || order > 11)
          invalid("Home gallery position must be between 1 and 11.");
        if (
          (await ctx.db.query("gallery").collect()).some(
            (item) =>
              item._id !== change.original?._id && item.homeOrder === order,
          )
        )
          invalid(
            "That home gallery position is already in use. Clear it on the other image first.",
          );
      }
      break;
    }
    case "carousel":
      required(change.data.desktopImage, "Desktop image");
      required(change.data.alt, "Image description");
      await eventExists(
        ctx,
        change.data.eventId,
        change.data.showWhenBookingOpen,
      );
      break;
    case "collaborations":
      required(change.data.name, "Name");
      required(change.data.logo, "Logo");
      break;
    case "testimonials":
      required(change.data.name, "Name");
      required(change.data.image, "Image");
      required(change.data.text, "Testimonial");
      break;
    case "marquee":
    case "terms":
      required(change.data.text, "Text");
      break;
    case "campaigns": {
      const campaign = change.data;
      required(campaign.id, "Campaign ID");
      timestamp(campaign.startsAt);
      timestamp(campaign.endsAt);
      if (Date.parse(campaign.endsAt) <= Date.parse(campaign.startsAt))
        invalid("A campaign must end after it starts.");
      if (change.original && change.original.id !== campaign.id)
        invalid("An existing campaign ID cannot be changed.");
      if (
        (await ctx.db.query("campaigns").collect()).some(
          (item) =>
            item._id !== change.original?._id && item.id === campaign.id,
        )
      )
        invalid("That campaign ID is already in use.");
      if (
        campaign.effects.priceFrom !== undefined &&
        (!Number.isFinite(campaign.effects.priceFrom) ||
          campaign.effects.priceFrom < 0)
      )
        invalid("Offer price must be zero or greater.");
      for (const id of campaign.eventIds) await eventExists(ctx, id, true);
      for (const slide of [
        campaign.effects.homeCarousel,
        campaign.effects.homePopup,
      ]) {
        required(slide.desktopImage, "Campaign image");
        required(slide.alt, "Campaign image description");
        await eventExists(ctx, slide.eventId, slide.showWhenBookingOpen);
      }
      break;
    }
  }
}

export const save = mutation({
  args: { secret: v.string(), change, publish: v.boolean() },
  returns: v.string(),
  handler: async (ctx, args) => {
    authorize(args.secret);
    const entry = args.change as CollectionChange;
    const previous = entry.original
      ? await ctx.db.get(entry.table, entry.original._id)
      : null;
    if (entry.original && canonical(previous) !== canonical(entry.original))
      conflict();
    await validate(ctx, entry);
    let id: string;
    if (previous) {
      await ctx.db.replace(entry.table, previous._id, {
        ...entry.data,
        position: previous.position,
      });
      id = previous._id;
    } else {
      const last = await ctx.db
        .query(entry.table)
        .withIndex("by_position")
        .order("desc")
        .first();
      id = await ctx.db.insert(entry.table, {
        ...entry.data,
        position: (last?.position ?? -1) + 1,
      });
    }
    if (
      entry.table === "artists" &&
      entry.original &&
      entry.original.name !== entry.data.name
    ) {
      const oldName = entry.original.name;
      const newName = entry.data.name;
      for (const event of await ctx.db.query("events").collect()) {
        if (
          [
            ...(event.details.artists ?? []),
            ...(event.details.defaultArtists ?? fallbackArtists),
          ].includes(oldName)
        ) {
          const renamed = (names: string[]) =>
            names.map((name) => (name === oldName ? newName : name));
          await ctx.db.patch("events", event._id, {
            details: {
              ...event.details,
              ...(event.details.artists
                ? { artists: renamed(event.details.artists) }
                : {}),
              defaultArtists: renamed(
                event.details.defaultArtists ?? fallbackArtists,
              ),
            },
          });
        }
      }
    }
    if (args.publish) await publishContent(ctx);
    return id;
  },
});

export const remove = mutation({
  args: { secret: v.string(), selection },
  returns: v.null(),
  handler: async (ctx, { secret, selection }) => {
    authorize(secret);
    const entry = selection as RecordSelection;
    const current = await ctx.db.get(entry.table, entry.original._id);
    if (canonical(current) !== canonical(entry.original)) conflict();
    if (entry.table === "artists") {
      const name = entry.original.name;
      if (
        (await ctx.db.query("events").collect()).some((event) =>
          [
            ...(event.details.artists ?? []),
            ...(event.details.defaultArtists ?? fallbackArtists),
          ].includes(name),
        )
      )
        invalid(
          "This artist is used by an event. Remove those artist references first, or hide the artist instead.",
        );
    }
    if (entry.table === "events") {
      const id = entry.original.id;
      const events = await ctx.db.query("events").collect();
      const carousel = await ctx.db.query("carousel").collect();
      const campaigns = await ctx.db.query("campaigns").collect();
      if (
        events.some(
          (event) =>
            event._id !== entry.original._id &&
            event.bookingOptions?.some(
              (option) => option.detailsEventId === id,
            ),
        ) ||
        carousel.some((slide) => slide.eventId === id) ||
        campaigns.some(
          (campaign) =>
            campaign.eventIds.includes(id) ||
            campaign.effects.homeCarousel.eventId === id ||
            campaign.effects.homePopup.eventId === id,
        )
      )
        invalid(
          "This event is linked by sessions, carousel slides, or campaigns. Remove those references first, or hide the event instead.",
        );
    }
    await ctx.db.delete(entry.table, entry.original._id);
    return null;
  },
});

export const reorder = mutation({
  args: {
    secret: v.string(),
    table,
    expected: v.array(v.object({ id: v.string(), position: v.number() })),
    ids: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { secret, table, expected, ids }) => {
    authorize(secret);
    const rows = await ctx.db.query(table).withIndex("by_position").collect();
    if (
      canonical(
        rows.map((row) => ({ id: row._id, position: row.position })),
      ) !== canonical(expected)
    )
      conflict();
    if (
      ids.length !== rows.length ||
      new Set(ids).size !== ids.length ||
      ids.some((id) => !rows.some((row) => row._id === id))
    )
      invalid("The content order is invalid. Reload and try again.");
    for (const [position, id] of ids.entries()) {
      const row = rows.find((row) => row._id === id)!;
      if (row.position !== position)
        await ctx.db.patch(table, row._id, { position });
    }
    return null;
  },
});
