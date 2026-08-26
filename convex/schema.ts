import { authTables } from "@convex-dev/auth/server";
import { defineSchema } from "convex/server";
import { ObservationsTable } from "./model/observations/schema";
import { RunsTable } from "./model/runs/schema";

const schema = defineSchema({
  ...authTables,
  observations: ObservationsTable,
  runs: RunsTable,
});

export default schema;
