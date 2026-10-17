import { internalQuery, type QueryCtx } from "./_generated/server";
import { siteContent, type SiteContent } from "./validators";

export async function readContent(
  ctx: Pick<QueryCtx, "db">,
): Promise<SiteContent> {
  const [
    events,
    artists,
    teams,
    gallery,
    carousel,
    collaborations,
    campaigns,
    marquee,
    testimonials,
    terms,
    seed,
  ] = await Promise.all([
    ctx.db.query("events").withIndex("by_position").collect(),
    ctx.db.query("artists").withIndex("by_position").collect(),
    ctx.db.query("teams").withIndex("by_position").collect(),
    ctx.db.query("gallery").withIndex("by_position").collect(),
    ctx.db.query("carousel").withIndex("by_position").collect(),
    ctx.db.query("collaborations").withIndex("by_position").collect(),
    ctx.db.query("campaigns").withIndex("by_position").collect(),
    ctx.db.query("marquee").withIndex("by_position").collect(),
    ctx.db.query("testimonials").withIndex("by_position").collect(),
    ctx.db.query("terms").withIndex("by_position").collect(),
    ctx.db
      .query("seeds")
      .withIndex("by_key", (q) => q.eq("key", "glorix-v1"))
      .unique(),
  ]);
  return {
    events,
    artists,
    teams,
    gallery,
    carousel,
    collaborations,
    campaigns,
    marquee,
    testimonials,
    terms,
    seeded: seed !== null,
  };
}

export const get = internalQuery({
  args: {},
  returns: siteContent,
  handler: readContent,
});
