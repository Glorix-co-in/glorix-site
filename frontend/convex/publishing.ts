import { v } from "convex/values";
import { internalMutation, query, type MutationCtx } from "./_generated/server";
import { readContent } from "./content";
import { siteContent } from "./validators";

export const current = query({
  args: {},
  returns: v.union(v.id("publications"), v.null()),
  handler: async (ctx) => {
    const publication = await ctx.db
      .query("publicationState")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    return publication?.version ?? null;
  },
});

export const snapshot = query({
  args: { version: v.optional(v.string()) },
  returns: v.union(siteContent, v.null()),
  handler: async (ctx, { version }) => {
    const current =
      version === undefined
        ? await ctx.db
            .query("publicationState")
            .withIndex("by_key", (q) => q.eq("key", "site"))
            .unique()
        : null;
    const id =
      version === undefined
        ? current?.version
        : ctx.db.normalizeId("publications", version);
    if (!id) return null;
    return (await ctx.db.get("publications", id))?.content ?? null;
  },
});

export async function publishContent(ctx: MutationCtx) {
  const content = await readContent(ctx);
  if (!content.seeded)
    throw new Error("Run seed:run before publishing content.");

  const publishedAt = Date.now();
  const version = await ctx.db.insert("publications", {
    content,
    publishedAt,
  });
  const current = await ctx.db
    .query("publicationState")
    .withIndex("by_key", (q) => q.eq("key", "site"))
    .unique();
  if (current) await ctx.db.patch("publicationState", current._id, { version });
  else await ctx.db.insert("publicationState", { key: "site", version });
  return { version, publishedAt };
}

export const publish = internalMutation({
  args: {},
  returns: v.object({ version: v.id("publications"), publishedAt: v.number() }),
  handler: publishContent,
});
