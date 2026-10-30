import { Loader2 } from "lucide-react";
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
import { busyLabel, ExportStatus } from "./ExportStatus";
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
  // Sem página aprovada a opção fica desligada, mesmo que tenha sido marcada antes.
  const onlyApprovedOn = onlyApproved && approved > 0;
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await studio.exportManual(format, onlyApprovedOn));
    } catch (err) {
      setError(errorMessage(err, t("Não foi possível exportar o manual.")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        // Fechar no meio da exportação esconderia o resultado; o botão e o Esc esperam o fim.
        if (!open || busy) return;
        setResult(null);
        setError(null);
      }}
    >
      <DialogTrigger asChild>
        {/* Primário do topo: mais peso que os vizinhos de texto e 44 px em tela de toque. */}
        <Button className="font-semibold [@media(pointer:coarse)]:h-11">{t("Exportar manual")}</Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        aria-busy={busy}
        showCloseButton={!busy}
        onEscapeKeyDown={(e) => busy && e.preventDefault()}
        onPointerDownOutside={(e) => busy && e.preventDefault()}
        onInteractOutside={(e) => busy && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">{t("Exportar manual")}</DialogTitle>
          <DialogDescription>{t('Cada página entra com a "Versão do manual" ou, sem ela, com o texto atual.')}</DialogDescription>
        </DialogHeader>

        <fieldset className="grid gap-2" disabled={busy}>
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

        <label className={cn("flex items-start gap-2.5 text-sm", approved === 0 && "opacity-60")}>
          <input
            type="checkbox"
            checked={onlyApprovedOn}
            disabled={approved === 0}
            onChange={(e) => setOnlyApproved(e.target.checked)}
            className="mt-0.5 size-4 accent-[var(--primary)]"
          />
          <span className="grid leading-tight">
            <span className="font-bold">{t("Só páginas aprovadas")}</span>
            <span className="text-xs text-muted-foreground">
              {approved === 0
                ? t("Nenhuma página está aprovada ou publicada. Aprove uma página para usar esta opção.")
                : tn(
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
        <ExportStatus
          busy={busy}
          format={format}
          formatLabel={FORMATS.find((f) => f.id === (result?.format ?? format))?.label ?? format}
          result={result}
        />

        <DialogFooter>
          <Button onClick={() => void run()} disabled={busy} className="[@media(pointer:coarse)]:h-11">
            {busy && <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden />}
            {busy ? busyLabel(format) : error ? t("Tentar de novo") : t("Exportar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
