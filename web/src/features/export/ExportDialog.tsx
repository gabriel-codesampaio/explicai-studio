import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStudioContext } from "@/hooks/StudioContext";
import { type ExportFormat, type ExportResult, errorMessage } from "@/lib/api";
import { t, tn } from "@/lib/i18n";
import { flattenItems } from "@/lib/tree";
import { cn } from "@/lib/utils";
import { ThemeFields } from "./ThemeFields";

const FORMATS: { id: ExportFormat; label: string; hint: string; ext: string }[] = [
  { id: "html", label: t("Site (HTML)"), hint: t("Um arquivo para publicar ou abrir no navegador."), ext: ".html" },
  { id: "pdf", label: "PDF", hint: t("Para imprimir ou mandar por e-mail."), ext: ".pdf" },
  { id: "markdown", label: t("Markdown para IA"), hint: t("Um arquivo só, com a legenda dos prints em texto."), ext: ".md" },
];

/** Botão "Exportar manual" do topo da página: escolhe o formato e a cor, exporta e mostra onde ficou. */
export function ExportDialog() {
  const studio = useStudioContext();
  const [format, setFormat] = useState<ExportFormat>("html");
  const [onlyApproved, setOnlyApproved] = useState(false);
  const approved = flattenItems(studio.manual?.pages ?? []).filter((p) => ["aprovado", "publicado"].includes(p.status)).length;
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await studio.exportManual(format, onlyApproved));
    } catch (err) {
      setError(errorMessage(err, t("Não foi possível exportar o manual.")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) return;
        setResult(null);
        setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button>{t("Exportar manual")}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">{t("Exportar manual")}</DialogTitle>
          <DialogDescription>{t('Cada página entra com a "Versão do manual" ou, sem ela, com o texto atual.')}</DialogDescription>
        </DialogHeader>

        <fieldset className="grid gap-2">
          <legend className="mb-2 rotulo">{t("Formato")}</legend>
          {FORMATS.map(({ id, label, hint, ext }) => (
            <label
              key={id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 has-focus-visible:outline-2 has-focus-visible:outline-ring",
                format === id ? "border-primary bg-accent" : "border-border hover:bg-muted",
              )}
            >
              <input
                type="radio"
                name="formato"
                value={id}
                checked={format === id}
                onChange={() => setFormat(id)}
                className="sr-only"
              />
              <span className="w-14 shrink-0 font-mono text-lg leading-tight font-medium text-primary" aria-hidden>
                {ext}
              </span>
              <span className="grid leading-tight">
                <span className="text-sm font-bold">{label}</span>
                <span className="text-xs text-muted-foreground">{hint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <label className="flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={onlyApproved}
            onChange={(e) => setOnlyApproved(e.target.checked)}
            className="mt-0.5 size-4 accent-[var(--primary)]"
          />
          <span className="grid leading-tight">
            <span className="font-bold">{t("Só páginas aprovadas")}</span>
            <span className="text-xs text-muted-foreground">
              {tn(
                approved,
                "{n} página aprovada ou publicada neste manual. As outras ficam de fora.",
                "{n} páginas aprovadas ou publicadas neste manual. As outras ficam de fora.",
              )}
            </span>
          </span>
        </label>

        {format !== "markdown" && studio.manual && <ThemeFields theme={studio.manual.theme} />}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {result && (
          <div role="status" className="grid gap-1 text-sm text-primary">
            <p>
              {tn(result.pages, "Pronto: {n} página exportada em", "Pronto: {n} páginas exportadas em")}{" "}
              <code className="font-mono text-xs">{result.file}</code>, {t("dentro da pasta do manual.")}
            </p>
            {result.warnings.length > 0 && (
              <ul className="list-disc pl-5 text-destructive">
                {result.warnings.map((w) => (
                  <li key={w}>{t("Ficou de fora: {motivo}", { motivo: w })}</li>
                ))}
              </ul>
            )}
            <a
              href={result.url}
              target="_blank"
              rel="noreferrer"
              className="flex w-fit items-center gap-1 font-bold text-primary underline-offset-2 hover:underline"
            >
              <ExternalLink className="size-3.5" aria-hidden /> Abrir {result.format === "pdf" ? "o PDF" : "o arquivo"}
            </a>
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => void run()} disabled={busy}>
            {busy ? t("Exportando…") : t("Exportar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
