// convex/exports.ts
import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

export const getUserDataForExport = query({
  args: {}, // não recebe mais nada do client
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Não autenticado");
    }

    const observations = await ctx.db
      .query("observations")
      .withIndex("by_client_id", (q) => q.eq("clientId", userId))
      .collect();

    const rows = [];

    for (const obs of observations) {
      const runs = await ctx.db
        .query("runs")
        .withIndex("by_observation", (q) =>
          q.eq("observationClientId", obs._id),
        )
        .collect();

      const corridas: (number | string)[] = [1, 2, 3, 4, 5].map((n) => {
        const run = runs.find((r) => r.ordem === n);
        return run?.desempenho ?? "";
      });

      const local = [obs.endereco, obs.cep, obs.lat, obs.lng]
        .filter((v) => v !== undefined && v !== null && v !== "")
        .join(" | ");

      rows.push({
        id: obs.nome,
        data: new Date(obs.notedAt).toLocaleDateString("pt-BR"),
        local,

        exposicaoAoSol: obs.exposicaoSol ?? "",
        sexo: obs.sexo ?? "",
        tb: obs.tb ?? "",
        tSubstrato: obs.tSubstrato ?? "",
        tAr: obs.tAr ?? "",
        crc: obs.crc ?? "",

        larguraDoCorpo: obs.larguraCorpo ?? "",
        alturaDoCorpo: obs.alturaCorpo ?? "",
        comprimentoDaCauda: obs.comprimentoCauda ?? "",
        comprimentoDaCabeca: obs.comprimentoCabeca ?? "",
        alturaDaCabeca: obs.alturaCabeca ?? "",
        larguraDaCabeca: obs.larguraCabeca ?? "",

        pataDianteiraDireita: obs.pataDiantDir ?? "",
        pataDianteiraEsquerda: obs.pataDiantEsq ?? "",
        pataTraseiraDireita: obs.pataTrasDir ?? "",
        pataTraseiraEsquerda: obs.pataTrasEsq ?? "",

        tcmin: obs.ctMin ?? "",

        corrida1: corridas[0],
        corrida2: corridas[1],
        corrida3: corridas[2],
        corrida4: corridas[3],
        corrida5: corridas[4],

        tcmax: obs.ctMax ?? "",
      });
    }

    return rows;
  },
});
