import { TriangleAlert } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ConflictDiff } from "@/lib/conflictDiff";
import { t, tn } from "@/lib/i18n";

interface Props {
  diff?: ConflictDiff | null;
  onReload: () => void;
  onKeep: () => void;
}

const BUTTON =
  "min-h-8 rounded-sm border border-border bg-background px-3 text-sm font-bold hover:bg-muted [@media(pointer:coarse)]:min-h-11";

const EXCERPT = 240;
const excerpt = (text: string) => (text.length > EXCERPT ? `${text.slice(0, EXCERPT)}…` : text) || t("(vazio)");

/**
 * A página mudou no disco depois que você a abriu. Nada é gravado nela até você escolher,
 * e cada botão diz o que acontece com o texto de cada lado. Fica por cima da página (sem empurrar o texto)
 * e mostra o trecho que difere, no disco e no texto da pessoa.
 */
export function DiskConflictBanner({ diff, onReload, onKeep }: Props) {
  const firstAction = useRef<HTMLButtonElement>(null);
  const origin = useRef<Element | null>(null);
  // Quem usa só teclado precisa notar a faixa: o foco vai à primeira ação; Esc devolve a quem o tinha (o editor, no mesmo ponto).
  useEffect(() => {
    origin.current = document.activeElement;
    firstAction.current?.focus();
  }, []);
  return (
    // h-0 + absolute: a faixa não ocupa espaço no fluxo, então o texto da página não se move ao ela aparecer.
    <div className="sticky top-0 z-20 h-0 shrink-0">
      <div
        role="alert"
        onKeyDown={(e) => {
          if (e.key === "Escape" && origin.current instanceof HTMLElement) origin.current.focus();
        }}
        className="absolute inset-x-0 top-0 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-destructive/50 bg-background px-4 py-2 text-sm shadow-md"
      >
        <TriangleAlert className="size-4 shrink-0 text-destructive" aria-hidden />
        <p className="min-w-0 flex-1 basis-72">
          <strong>{t("Esta página mudou fora do Studio.")}</strong>{" "}
          {t(
            "Manter a minha versão grava o seu texto por cima do arquivo. Recarregar do disco descarta o que você escreveu aqui.",
          )}
        </p>
        {diff && (
          <div className="grid basis-full gap-1 text-xs">
            <p className="text-muted-foreground">{tn(diff.lines, "{n} linha difere.", "{n} linhas diferem.")}</p>
            <dl className="grid gap-2 sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="rotulo">{t("No disco")}</dt>
                <dd className="max-h-20 overflow-y-auto whitespace-pre-wrap break-words font-mono">{excerpt(diff.disk)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="rotulo">{t("O seu texto")}</dt>
                <dd className="max-h-20 overflow-y-auto whitespace-pre-wrap break-words font-mono">{excerpt(diff.mine)}</dd>
              </div>
            </dl>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button ref={firstAction} type="button" onClick={onKeep} className={BUTTON}>
            {t("Manter a minha versão")}
          </button>
          <button type="button" onClick={onReload} className={BUTTON}>
            {t("Recarregar do disco")}
          </button>
        </div>
      </div>
    </div>
  );
}
