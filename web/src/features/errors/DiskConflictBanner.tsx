import { TriangleAlert } from "lucide-react";
import { t } from "@/lib/i18n";

interface Props {
  onReload: () => void;
  onKeep: () => void;
}

const BUTTON =
  "min-h-8 rounded-sm border border-border bg-background px-3 text-sm font-bold hover:bg-muted [@media(pointer:coarse)]:min-h-11";

/**
 * A página mudou no disco depois que você a abriu. Nada é gravado nela até você escolher,
 * e cada botão diz o que acontece com o texto de cada lado.
 */
export function DiskConflictBanner({ onReload, onKeep }: Props) {
  return (
    <div
      role="alert"
      className="sticky top-0 z-20 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-destructive/50 bg-background px-4 py-2 text-sm"
    >
      <TriangleAlert className="size-4 shrink-0 text-destructive" aria-hidden />
      <p className="min-w-0 flex-1 basis-72">
        <strong>{t("Esta página mudou fora do Studio.")}</strong>{" "}
        {t("Manter a minha versão grava o seu texto por cima do arquivo. Recarregar do disco descarta o que você escreveu aqui.")}
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onKeep} className={BUTTON}>
          {t("Manter a minha versão")}
        </button>
        <button type="button" onClick={onReload} className={BUTTON}>
          {t("Recarregar do disco")}
        </button>
      </div>
    </div>
  );
}
