import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const createRun = mutation({
  args: {
    clientId: v.string(),
    observationClientId: v.string(),
    ordem: v.number(),
    temperatura: v.number(),
    desempenho: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const clientId = await getAuthUserId(ctx);
    if (!clientId) throw new Error("Não autenticado");
    return await ctx.db.insert("runs", {
      clientId,
      observationClientId: args.observationClientId,
      ordem: args.ordem,
      temperatura: args.temperatura,
      desempenho: args.desempenho,
    });
  },
});
export const updateRun = mutation({
  args: {
    id: v.id("runs"),
    observationClientId: v.string(),
    ordem: v.number(),
    temperatura: v.number(),
    desempenho: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...dados } = args;

    await ctx.db.patch(id, dados);

    return id;
  },
});

export const attachVideoToRun = mutation({
  args: {
    id: v.id("runs"),
    videoKey: v.string(),
  },
  handler: async (ctx, args) => {
    const publicUrl = process.env.R2_PUBLIC_URL;
    if (!publicUrl) {
      throw new Error("R2_PUBLIC_URL não configurada no Convex");
    }
    await ctx.db.patch(args.id, {
      videoKey: args.videoKey,
      videoUrl: `${publicUrl}/${args.videoKey}`,
    });
    return args.id;
  },
});
