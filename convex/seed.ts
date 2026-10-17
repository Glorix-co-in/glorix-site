import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { seeds } from "./seedData";
import type { ContentTable } from "./validators";

export const run = internalMutation({
  args: {},
  returns: v.object({
    status: v.union(v.literal("seeded"), v.literal("already-seeded")),
    inserted: v.number(),
  }),
  handler: async (ctx) => {
    const previous = await ctx.db
      .query("seeds")
      .withIndex("by_key", (q) => q.eq("key", "glorix-v1"))
      .unique();
    if (previous) return { status: "already-seeded" as const, inserted: 0 };

    const tables = Object.keys(seeds) as ContentTable[];
    for (const table of tables) {
      if (await ctx.db.query(table).first()) {
        throw new Error(
          `Cannot seed: ${table} already contains data. The seed only runs on empty content tables.`,
        );
      }
    }

    let inserted = 0;
    for (const table of tables) {
      for (const [position, row] of seeds[table].entries()) {
        await ctx.db.insert(table, { ...row, position });
        inserted++;
      }
    }
    await ctx.db.insert("seeds", { key: "glorix-v1", completedAt: Date.now() });
    return { status: "seeded" as const, inserted };
  },
});
