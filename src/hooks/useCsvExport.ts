// hooks/useCsvExport.ts
import Papa from "papaparse";

export async function exportToCsv(
  data: Record<string, any>[],
  filename: string,
) {
  if (data.length === 0) {
    throw new Error("Nenhum dado para exportar");
  }

  const csv = "\uFEFF" + Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const file = new File([blob], `${filename}.csv`, { type: "text/csv" });

  // Tenta usar o share sheet nativo (importante pro PWA instalado, principalmente iOS)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: filename,
      });
      return;
    } catch (err) {
      // usuário cancelou o share — não faz nada
      if ((err as Error).name === "AbortError") return;
    }
  }

  // Fallback: download tradicional (desktop e Android)
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
