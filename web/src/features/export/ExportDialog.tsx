import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useManualCheck } from "@/features/check/useManualCheck";
import { ManualAppearanceDialog } from "@/features/settings/ManualAppearanceDialog";
import { useStudioContext } from "@/hooks/StudioContext";
import { type ExportFormat, type ExportResult, errorMessage } from "@/lib/api";
import { t, tn } from "@/lib/i18n";
import { flattenItems } from "@/lib/tree";
import { cn } from "@/lib/utils";
import { busyLabel, ExportStatus } from "./ExportStatus";

const FORMATS: { id: ExportFormat; label: string; hint: string; ext: string }[] = [
  { id: "html", label: t("Site (HTML)"), hint: t("Um arquivo para publicar ou abrir no navegador."), ext: ".html" },
  { id: "pdf", label: "PDF", hint: t("Para imprimir ou mandar por e-mail."), ext: ".pdf" },
  { id: "markdown", label: t("Markdown para IA"), hint: t("Um arquivo só, com a legenda dos prints em texto."), ext: ".md" },
];

/** Botão "Exportar manual" do topo da página: escolhe o formato, exporta e mostra onde ficou. */
// O Radix não aceita value "" em item: esta sentinela fica só aqui; o valor de fora segue "".
const TODOS = "__todos__";

export function ExportDialog({ open, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const studio = useStudioContext();
  // Só avisa: a contagem não bloqueia o export. Refaz ao abrir, para não mostrar número velho.
  const check = useManualCheck(studio.manual?.slug);
  const checkCount = check.findings?.length ?? 0;
  const { reload } = check;
  // biome-ignore lint/correctness/useExhaustiveDependencies: refaz só quando o diálogo abre
  useEffect(() => {
    if (open) reload();
  }, [open]);
  const [format, setFormat] = useState<ExportFormat>("html");
  const [onlyApproved, setOnlyApproved] = useState(false);
  const approved = flattenItems(studio.manual?.pages ?? []).filter((p) => ["aprovado", "publicado"].includes(p.status)).length;
  // Sem página aprovada a opção fica desligada, mesmo que tenha sido marcada antes.
  const onlyApprovedOn = onlyApproved && approved > 0;
  const audiences = studio.manual?.audiences ?? [];
  const [audience, setAudience] = useState("");
  const audienceOn = audiences.includes(audience) ? audience : "";
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const appearanceBtn = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const feedback = useRef<HTMLDivElement>(null);
  // Resultado ou erro novo: leva o foco ao aviso (anunciado pelo role=status/alert) e o põe à vista.
  useEffect(() => {
    if (!result && !error) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    feedback.current?.focus({ preventScroll: true });
    feedback.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [result, error]);

  const run = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await studio.exportManual(format, onlyApprovedOn, audienceOn || undefined));
    } catch (err) {
      setError(errorMessage(err, t("Não foi possível exportar o manual.")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Fechar no meio da exportação esconderia o resultado; o botão e o Esc esperam o fim.
        if (!next && busy) return;
        onOpenChange?.(next);
        if (next) return;
        setResult(null);
        setError(null);
      }}
    >
      <DialogTrigger asChild>
        {/* Primário do topo: mais peso que os vizinhos de texto e 44 px em tela de toque. */}
        <Button
          data-passeio="exportar"
          aria-describedby={checkCount > 0 ? "export-check-count" : undefined}
          className="font-semibold [@media(pointer:coarse)]:h-11"
        >
          {t("Exportar manual")}
          {checkCount > 0 && (
            <span aria-hidden className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 text-xs tabular-nums">
              {checkCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      {checkCount > 0 && (
        <span id="export-check-count" className="sr-only">
          {tn(checkCount, "{n} achado na checagem do manual.", "{n} achados na checagem do manual.")}
        </span>
      )}
      <DialogContent
        className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        aria-busy={busy}
        showCloseButton={!busy}
        onEscapeKeyDown={(e) => busy && e.preventDefault()}
        onPointerDownOutside={(e) => busy && e.preventDefault()}
        onInteractOutside={(e) => busy && e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pr-12 pb-4">
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">{t("Exportar manual")}</DialogTitle>
          <DialogDescription>{t('Cada página entra com a "Versão do manual" ou, sem ela, com o texto atual.')}</DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-6 pb-4">
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

          {audiences.length > 0 && (
            <label htmlFor="para-quem" className="grid gap-1.5 text-sm">
              <span className="font-bold">{t("Público do export")}</span>
              <Select value={audienceOn || TODOS} onValueChange={(v) => setAudience(v === TODOS ? "" : v)} disabled={busy}>
                <SelectTrigger id="para-quem">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>{t("Todos (o manual inteiro)")}</SelectItem>
                  {audiences.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                {t(
                  "Só entram as páginas desse público e as sem restrição. Links para as outras viram texto. Não é controle de acesso.",
                )}
              </span>
            </label>
          )}

          {format !== "markdown" && (
            <p className="text-xs text-muted-foreground">
              {t("Cores, fontes, capa e rodapé:")}{" "}
              <button
                ref={appearanceBtn}
                type="button"
                disabled={busy}
                onClick={() => setAppearanceOpen(true)}
                className="cursor-pointer font-bold text-primary underline underline-offset-2 [@media(pointer:coarse)]:min-h-11"
              >
                {t("Aparência do manual")}
              </button>
            </p>
          )}
          <ManualAppearanceDialog
            open={appearanceOpen}
            onOpenChange={(open) => {
              setAppearanceOpen(open);
              // O diálogo de dentro não tem gatilho próprio: devolve o foco ao ponteiro depois que o Radix terminar.
              if (!open) setTimeout(() => appearanceBtn.current?.focus(), 0);
            }}
          />
        </div>

        {/* Rodapé fixo: o botão e o resultado ficam à vista; só o miolo acima rola. */}
        <DialogFooter className="max-h-[45vh] flex-col overflow-y-auto border-t px-6 py-4 sm:justify-start">
          <div ref={feedback} tabIndex={-1} className="grid gap-2 outline-none empty:hidden">
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
          </div>
          <Button onClick={() => void run()} disabled={busy} className="[@media(pointer:coarse)]:h-11 sm:self-end">
            {busy && <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden />}
            {busy ? busyLabel(format) : error ? t("Tentar de novo") : t("Exportar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
