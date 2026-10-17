import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { bookingEvent } from "./validators";
import { publishContent } from "./publishing";
import { canonical, eventData } from "../shared/events";
import { authorize } from "./lib/admin";

export const saveEvent = mutation({
  args: {
    secret: v.string(),
    eventId: v.union(v.id("events"), v.null()),
    expected: v.union(bookingEvent, v.null()),
    event: bookingEvent,
    publish: v.boolean(),
  },
  returns: v.id("events"),
  handler: async (ctx, args) => {
    authorize(args.secret);
    const current = args.eventId
      ? await ctx.db.get("events", args.eventId)
      : null;
    if (args.eventId && !current)
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "This event no longer exists.",
      });
    if (current && canonical(eventData(current)) !== canonical(args.expected))
      throw new ConvexError({
        code: "CONFLICT",
        message:
          "This event changed since you opened it. Reload the events and try again.",
      });
    const event = args.event;
    if (current && event.id !== current.id)
      throw new ConvexError({
        code: "INVALID",
        message: "The event URL cannot be changed.",
      });
    if (!current) {
      if (
        args.expected !== null ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(event.id)
      )
        throw new ConvexError({
          code: "INVALID",
          message:
            "Use a unique event URL with lowercase letters, numbers, and hyphens.",
        });
      if (
        await ctx.db
          .query("events")
          .withIndex("by_event_id", (q) => q.eq("id", event.id))
          .unique()
      )
        throw new ConvexError({
          code: "INVALID",
          message: "That event URL is already in use.",
        });
    }
    if (![event.title, event.date, event.image].every((value) => value.trim()))
      throw new ConvexError({
        code: "INVALID",
        message: "Title, display date, and poster are required.",
      });
    if (
      event.details.priceFrom !== undefined &&
      (!Number.isFinite(event.details.priceFrom) || event.details.priceFrom < 0)
    )
      throw new ConvexError({
        code: "INVALID",
        message: "Price must be zero or greater.",
      });
    if (
      event.bookingOrder !== undefined &&
      (!Number.isSafeInteger(event.bookingOrder) || event.bookingOrder < 0)
    )
      throw new ConvexError({
        code: "INVALID",
        message: "Listing order must be a whole number, zero or greater.",
      });
    for (const key of [
      "bookingOpensAtISO",
      "bookingEndsAtISO",
      "eventStartsAtISO",
    ] as const) {
      const value = event.details[key];
      if (
        value &&
        (!Number.isFinite(Date.parse(value)) ||
          !/(Z|[+-]\d{2}:\d{2})$/i.test(value))
      )
        throw new ConvexError({
          code: "INVALID",
          message:
            "Use a valid date and timezone for booking and event timestamps.",
        });
    }
    for (const value of [
      event.bookingLink,
      event.details.venueLink,
      ...(event.bookingOptions?.map((option) => option.link) ?? []),
    ]) {
      if (!value) continue;
      try {
        const url = new URL(value);
        if (!["https:", "http:"].includes(url.protocol)) throw new Error();
      } catch {
        throw new ConvexError({
          code: "INVALID",
          message:
            "Booking and venue links must start with https:// or http://.",
        });
      }
    }
    for (const option of event.bookingOptions ?? []) {
      if (!option.date.trim() || !option.time.trim())
        throw new ConvexError({
          code: "INVALID",
          message: "Every session needs a date and time.",
        });
      if (
        option.detailsEventId &&
        !(await ctx.db
          .query("events")
          .withIndex("by_event_id", (q) => q.eq("id", option.detailsEventId!))
          .unique())
      )
        throw new ConvexError({
          code: "INVALID",
          message: "A linked session event could not be found.",
        });
    }
    let id;
    if (current) {
      await ctx.db.replace("events", current._id, {
        ...event,
        position: current.position,
      });
      id = current._id;
    } else {
      const last = await ctx.db
        .query("events")
        .withIndex("by_position")
        .order("desc")
        .first();
      id = await ctx.db.insert("events", {
        ...event,
        position: (last?.position ?? -1) + 1,
      });
    }
    if (args.publish) await publishContent(ctx);
    return id;
  },
});

export const publish = mutation({
  args: { secret: v.string() },
  returns: v.null(),
  handler: async (ctx, { secret }) => {
    authorize(secret);
    await publishContent(ctx);
    return null;
  },
});

export const loginAttempt = mutation({
  args: { secret: v.string(), key: v.string() },
  returns: v.number(),
  handler: async (ctx, { secret, key }) => {
    authorize(secret);
    const now = Date.now();
    const window = 15 * 60 * 1000;
    const previous = await ctx.db
      .query("adminLoginAttempts")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (previous && now - previous.startedAt < window) {
      if (previous.attempts >= 5)
        return Math.ceil((previous.startedAt + window - now) / 1000);
      await ctx.db.patch("adminLoginAttempts", previous._id, {
        attempts: previous.attempts + 1,
      });
    } else if (previous)
      await ctx.db.patch("adminLoginAttempts", previous._id, {
        startedAt: now,
        attempts: 1,
      });
    else
      await ctx.db.insert("adminLoginAttempts", {
        key,
        startedAt: now,
        attempts: 1,
      });
    return 0;
  },
});
