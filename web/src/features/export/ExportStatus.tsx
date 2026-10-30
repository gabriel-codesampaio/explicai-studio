import { Check, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import type { ExportFormat, ExportResult } from "@/lib/api";
import { t, tn } from "@/lib/i18n";

/** Texto da etapa em andamento. O PDF abre um navegador e demora mais; sem barra, porque não há porcentagem real. */
export function busyLabel(format: ExportFormat) {
  return format === "pdf" ? t("Gerando PDF…") : t("Exportando…");
}

/**
 * Região de status sempre montada (leitor de tela só anuncia o que muda dentro de uma região que já existe):
 * mostra a etapa enquanto exporta e, depois, o resultado com formato, páginas, caminho e avisos.
 */
export function ExportStatus({
  busy,
  format,
  formatLabel,
  result,
}: {
  busy: boolean;
  format: ExportFormat;
  formatLabel: string;
  result: ExportResult | null;
}) {
  return (
    <div role="status" className="grid gap-2 text-sm empty:hidden">
      {busy && (
        <p className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          {busyLabel(format)}
          {format === "pdf" && <span className="text-xs">{t("Pode levar alguns segundos.")}</span>}
        </p>
      )}
      {!busy && result && <ExportDone result={result} formatLabel={formatLabel} />}
    </div>
  );
}

function ExportDone({ result, formatLabel }: { result: ExportResult; formatLabel: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => void navigator.clipboard?.writeText(result.file).then(() => setCopied(true));
  const action =
    "inline-flex w-fit items-center gap-1 rounded-md font-bold text-primary underline-offset-2 hover:underline [@media(pointer:coarse)]:min-h-11";
  return (
    <div className="grid gap-2 rounded-md border border-primary/40 bg-accent p-3">
      <p className="flex items-center gap-2 font-bold">
        <Check className="size-4 shrink-0 text-primary" aria-hidden />
        {t("{formato} exportado", { formato: formatLabel })}
        {" · "}
        {tn(result.pages, "{n} página", "{n} páginas")}
      </p>
      <p className="grid gap-1">
        <span className="text-xs text-muted-foreground">{t("Arquivo, dentro da pasta do manual")}</span>
        <code className="font-mono text-xs break-all">{result.file}</code>
      </p>
      {result.warnings.length > 0 && (
        <div className="grid gap-1 border-l-2 border-destructive pl-3">
          <p className="font-bold text-destructive">{tn(result.warnings.length, "Atenção: {n} aviso", "Atenção: {n} avisos")}</p>
          <ul className="list-disc pl-5">
            {result.warnings.map((w) => (
              <li key={w}>{t("Ficou de fora: {motivo}", { motivo: w })}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-x-4">
        <a href={result.url} target="_blank" rel="noreferrer" className={action}>
          <ExternalLink className="size-3.5" aria-hidden /> {result.format === "pdf" ? t("Abrir o PDF") : t("Abrir o arquivo")}
        </a>
        <button type="button" onClick={copy} className={action}>
          {copied ? t("Caminho copiado") : t("Copiar caminho")}
        </button>
      </div>
    </div>
  );
}
