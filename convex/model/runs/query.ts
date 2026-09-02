import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "../../_generated/server";

export const list = query({
  args: {
    observationClientId: v.optional(v.id("observations")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.observationClientId) {
      return ctx.db
        .query("runs")
        .withIndex("by_observation", (q) =>
          q.eq("observationClientId", args.observationClientId!),
        )
        .order("asc")
        .collect();
    }

    return ctx.db
      .query("runs")
      .withIndex("by_client_id", (q) => q.eq("clientId", userId))
      .order("asc")
      .collect();
  },
});
