import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const create = mutation({
  args: {
    clientId: v.string(), // UUID = idempotência
    nome: v.string(),
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
  },
  handler: async (ctx, args) => {
    const clientId = await getAuthUserId(ctx);
    if (!clientId) throw new Error("Não autenticado");
    return await ctx.db.insert("observations", {
      clientId,
      nome: args.nome, // "Priscilla"
      notedAt: args.notedAt,

      // localização
      endereco: args.endereco,
      cep: args.cep,
      lat: args.lat,
      lng: args.lng,

      // condições
      exposicaoSol: args.exposicaoSol, // "sol" | "sombra"
      sexo: args.sexo, // "femea" | "macho"

      // temperaturas do momento (°C)
      tb: args.tb, // temperatura basal
      tSubstrato: args.tSubstrato,
      tAr: args.tAr,

      // limites térmicos do indivíduo (°C)
      ctMin: args.ctMin,
      ctMax: args.ctMax,
      tPref: args.tPref, // temperatura preferencial

      // morfometria (mm)
      crc: args.crc,
      larguraCorpo: args.larguraCorpo,
      alturaCorpo: args.alturaCorpo,
      comprimentoCauda: args.comprimentoCauda,
      comprimentoCabeca: args.comprimentoCabeca,
      alturaCabeca: args.alturaCabeca,
      larguraCabeca: args.larguraCabeca,
      pataDiantDir: args.pataDiantDir,
      pataDiantEsq: args.pataDiantEsq,
      pataTrasDir: args.pataTrasDir,
      pataTrasEsq: args.pataTrasEsq,

      // mídia (como já montamos antes)
      mediaId: args.mediaId,
      mediaType: args.mediaType,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("observations"),

    nome: v.string(),
    notedAt: v.number(),

    endereco: v.optional(v.string()),
    cep: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),

    exposicaoSol: v.optional(v.string()),
    sexo: v.optional(v.string()),

    tb: v.optional(v.number()),
    tSubstrato: v.optional(v.number()),
    tAr: v.optional(v.number()),

    ctMin: v.optional(v.number()),
    ctMax: v.optional(v.number()),
    tPref: v.optional(v.number()),

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
  },

  handler: async (ctx, args) => {
    const { id, ...dados } = args;

    await ctx.db.patch(id, dados);

    return id;
  },
});
