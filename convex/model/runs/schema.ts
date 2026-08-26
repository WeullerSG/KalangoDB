import { defineTable } from "convex/server";
import { v } from "convex/values";

export const RunsTable = defineTable({
  clientId: v.string(),
  observationClientId: v.string(),
  ordem: v.number(),
  temperatura: v.number(),
  desempenho: v.optional(v.number()),
})
  .index("by_client_id", ["clientId"])
  .index("by_observation", ["observationClientId"]);
