// hooks/useCsvExport.ts
import Papa from "papaparse";

const columns = [
  { key: "id", label: "ID" },
  { key: "data", label: "Data" },
  { key: "local", label: "Local" },
  { key: "exposicaoAoSol", label: "Exposição ao sol" },
  { key: "sexo", label: "Sexo" },
  { key: "tb", label: "Tb" },
  { key: "tSubstrato", label: "Tsubstrato" },
  { key: "tAr", label: "T ar" },
  { key: "crc", label: "CRC" },
  { key: "larguraDoCorpo", label: "Largura do corpo" },
  { key: "alturaDoCorpo", label: "Altura do corpo" },
  { key: "comprimentoDaCauda", label: "Comprimento da cauda" },
  { key: "comprimentoDaCabeca", label: "Comprimento da cabeça" },
  { key: "alturaDaCabeca", label: "Altura da cabeça" },
  { key: "larguraDaCabeca", label: "Largura da cabeça" },
  { key: "pataDianteiraDireita", label: "Pata dianteira direita" },
  { key: "pataDianteiraEsquerda", label: "Pata dianteira esquerda" },
  { key: "pataTraseiraDireita", label: "Pata traseira direita" },
  { key: "pataTraseiraEsquerda", label: "Pata traseira esquerda" },
  { key: "tcmin", label: "Tcmin" },
  { key: "corrida1", label: "Corrida 1" },
  { key: "corrida2", label: "Corrida 2" },
  { key: "corrida3", label: "Corrida 3" },
  { key: "corrida4", label: "Corrida 4" },
  { key: "corrida5", label: "Corrida 5" },
  { key: "tcmax", label: "Tcmax" },
];

export async function exportToCsv(
  data: Record<string, any>[],
  filename: string,
) {
  if (data.length === 0) {
    throw new Error("Nenhum dado para exportar");
  }

  const formatted = data.map((row) => {
    const formattedRow: Record<string, any> = {};

    columns.forEach(({ key, label }) => {
      formattedRow[label] = row[key] ?? "";
    });
    return formattedRow;
  });

  const csv = "\uFEFF" + Papa.unparse(formatted);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const file = new File([blob], `${filename}.csv`, { type: "text/csv" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: filename,
      });
      return;
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
