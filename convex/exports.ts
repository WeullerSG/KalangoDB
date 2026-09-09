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
        ID: obs.nome,
        Data: new Date(obs.notedAt).toLocaleDateString("pt-BR"),
        Local: local,
        "Exposicao ao sol": obs.exposicaoSol ?? "",
        Sexo: obs.sexo ?? "",
        Tb: obs.tb ?? "",
        Tsubstrato: obs.tSubstrato ?? "",
        "T ar": obs.tAr ?? "",
        CRC: obs.crc ?? "",
        "Largura do corpo": obs.larguraCorpo ?? "",
        "Altura do corpo": obs.alturaCorpo ?? "",
        "Comprimento da cauda": obs.comprimentoCauda ?? "",
        "Comprimento da cabeca": obs.comprimentoCabeca ?? "",
        "Altura da cabeca": obs.alturaCabeca ?? "",
        "Largura da cabeca": obs.larguraCabeca ?? "",
        "Pata dianteira direita": obs.pataDiantDir ?? "",
        "Pata dianteira esquerda": obs.pataDiantEsq ?? "",
        "Pata traseira direita": obs.pataTrasDir ?? "",
        "Pata traseira esquerda": obs.pataTrasEsq ?? "",
        Tcmin: obs.ctMin ?? "",
        "Corrida 1": corridas[0],
        "Corrida 2": corridas[1],
        "Corrida 3": corridas[2],
        "Corrida 4": corridas[3],
        "Corrida 5": corridas[4],
        Tcmax: obs.ctMax ?? "",
      });
    }

    return rows;
  },
});
