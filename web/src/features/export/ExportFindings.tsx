import { ArrowUpRight } from "lucide-react";
import { findingDetail, kindFix, kindLabel } from "@/features/check/findingText";
import type { CheckFinding } from "@/lib/api";
import { t, tn } from "@/lib/i18n";

/** "Checagem do manual" dentro do Exportar: o que a contagem do botão quer dizer, achado a achado. Só avisa, não bloqueia. */
export function ExportFindings({ findings, onOpenPage }: { findings: CheckFinding[]; onOpenPage: (pageId: string) => void }) {
  return (
    <section aria-labelledby="export-check-title" className="grid gap-2">
      <h3 id="export-check-title" className="rotulo">
        {t("Checagem do manual")}
        {findings.length > 0 && ` · ${tn(findings.length, "{n} achado", "{n} achados")}`}
      </h3>
      {findings.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("Nenhum achado.")}</p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {t("Problemas que podem deixar o manual incompleto. Eles não impedem de exportar.")}
          </p>
          <ul className="grid gap-1.5">
            {findings.map((f, i) => {
              const fix = kindFix(f.kind);
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: a lista não reordena e dois achados podem ser idênticos
                <li key={i} className="flex items-start gap-3 rounded-md border border-border px-3 py-2">
                  <span className="grid min-w-0 flex-1 gap-0.5 leading-tight">
                    <span className="text-sm font-bold">{kindLabel(f.kind)}</span>
                    <span className="text-xs break-words text-muted-foreground">
                      {f.title || t("Sem título")}: {findingDetail(f.kind, f.detail)}
                    </span>
                    {fix && <span className="text-xs">{fix}</span>}
                  </span>
                  <button
                    type="button"
                    aria-label={t("Abrir página {titulo}: {tipo}", {
                      titulo: f.title || t("Sem título"),
                      tipo: kindLabel(f.kind),
                    })}
                    onClick={() => onOpenPage(f.pageId)}
                    className="flex min-h-11 shrink-0 cursor-pointer items-center gap-1 text-xs font-bold text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {t("Abrir página")}
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
