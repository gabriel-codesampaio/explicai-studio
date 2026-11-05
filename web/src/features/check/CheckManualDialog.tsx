import { AlertTriangle, ArrowUpRight, CircleHelp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MANUAL_SWITCHER_ID } from "@/features/manuals/ManualSwitcher";
import { type CheckFinding, errorMessage } from "@/lib/api";
import { t, tn } from "@/lib/i18n";
import { findingDetail, kindLabel } from "./findingText";
import { useManualCheck } from "./useManualCheck";

interface Props {
  slug: string;
  onOpenPage: (pageId: string) => void;
  onClose: () => void;
}

const byPage = (findings: CheckFinding[]) => {
  const groups = new Map<string, { title: string; items: CheckFinding[] }>();
  for (const f of findings) {
    const group = groups.get(f.pageId) ?? { title: f.title, items: [] };
    group.items.push(f);
    groups.set(f.pageId, group);
  }
  return [...groups.entries()];
};

/** "Checar manual": os achados do checkManual agrupados por página. Clicar num achado abre a página. Só lê, não corrige. */
export function CheckManualDialog({ slug, onOpenPage, onClose }: Props) {
  // O diálogo monta ao abrir, então a conferência é sempre nova.
  const { findings, error } = useManualCheck(slug);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          document.getElementById(MANUAL_SWITCHER_ID)?.focus();
        }}
      >
        <DialogHeader className="px-6 pt-6 pr-12 pb-4 text-left">
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">{t("Checar manual")}</DialogTitle>
          <DialogDescription>
            {t("Confere o manual inteiro sem mudar nada. Clique num achado para abrir a página.")}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage(error, t("Não foi possível checar o manual."))}
            </p>
          ) : findings === null ? (
            <p role="status" className="text-sm text-muted-foreground">
              {t("Conferindo o manual…")}
            </p>
          ) : findings.length === 0 ? (
            <p role="status" className="text-sm">
              {t("Nenhum problema encontrado.")}
            </p>
          ) : (
            <>
              <p role="status" className="mb-3 text-sm text-muted-foreground">
                {tn(findings.length, "{n} achado", "{n} achados")}
              </p>
              <div className="grid gap-4">
                {byPage(findings).map(([pageId, { title, items }]) => (
                  <section key={pageId} aria-labelledby={`check-${pageId}`}>
                    <h3 id={`check-${pageId}`} className="mb-1.5 font-display text-base font-bold">
                      {title || t("Sem título")}
                    </h3>
                    <ul className="grid gap-1.5">
                      {items.map((f, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: a lista não reordena e dois achados podem ser idênticos
                        <li key={i}>
                          <FindingRow finding={f} onOpen={() => onOpenPage(pageId)} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FindingRow({ finding, onOpen }: { finding: CheckFinding; onOpen: () => void }) {
  // "A confirmar" é lembrete, não defeito: ícone neutro em vez de alerta. Defeito leva a cor de erro (o formato do ícone também muda, cor não é o único sinal).
  const reminder = finding.kind === "to-confirm" || finding.kind === "not-reviewed";
  const Icon = reminder ? CircleHelp : AlertTriangle;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-h-11 w-full items-start gap-3 rounded-md border border-border px-3 py-2 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
    >
      <Icon className={`mt-0.5 size-4 shrink-0 ${reminder ? "text-muted-foreground" : "text-destructive"}`} aria-hidden />
      <span className="grid min-w-0 flex-1 leading-tight">
        <span className="text-sm font-bold">{kindLabel(finding.kind)}</span>
        <span className="text-sm break-words text-muted-foreground">{findingDetail(finding.kind, finding.detail)}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-primary">
        <span className="max-sm:sr-only">{t("Abrir página")}</span> <ArrowUpRight className="size-3.5" aria-hidden />
      </span>
    </button>
  );
}
