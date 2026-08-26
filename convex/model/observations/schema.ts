import { defineTable } from "convex/server";
import { v } from "convex/values";

export const ObservationsTable = defineTable({
  clientId: v.id("users"),
  nome: v.string(), // "Priscilla"
  notedAt: v.number(),

  // localização
  endereco: v.optional(v.string()),
  cep: v.optional(v.string()),
  lat: v.optional(v.number()),
  lng: v.optional(v.number()),

  // condições
  exposicaoSol: v.optional(v.string()), // "sol" | "sombra"
  sexo: v.optional(v.string()), // "femea" | "macho"

  // temperaturas do momento (°C)
  tb: v.optional(v.number()), // temperatura basal
  tSubstrato: v.optional(v.number()),
  tAr: v.optional(v.number()),

  // limites térmicos do indivíduo (°C)
  ctMin: v.optional(v.number()),
  ctMax: v.optional(v.number()),
  tPref: v.optional(v.number()), // temperatura preferencial

  // morfometria (mm)
  crc: v.optional(v.number()),
  larguraCorpo: v.optional(v.number()),
  alturaCorpo: v.optional(v.number()),
  comprimentoCauda: v.optional(v.number()),
  comprimentoCabeca: v.optional(v.number()),
  alturaCabeca: v.optional(v.number()),
  larguraCabeca: v.optional(v.number()),
  pataDiantDir: v.optional(v.number()),
  pataDiantEsq: v.optional(v.number()),
  pataTrasDir: v.optional(v.number()),
  pataTrasEsq: v.optional(v.number()),

  // mídia (como já montamos antes)
  mediaId: v.optional(v.id("_storage")),
  mediaType: v.optional(v.string()),
}).index("by_client_id", ["clientId"]);
