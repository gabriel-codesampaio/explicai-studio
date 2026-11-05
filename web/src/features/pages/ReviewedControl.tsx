import { CheckCheck } from "lucide-react";
import { t } from "@/lib/i18n";
import { reviewedLabel } from "@/lib/reviewed";

/** "Conferida em …" e o botão que grava o dia de hoje. Só informa: nada bloqueia a página. */
export function ReviewedControl({ reviewed, onMark }: { reviewed: string | undefined; onMark: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <span className="px-1 text-xs text-muted-foreground" data-testid="reviewed-label" aria-live="polite">
        {reviewedLabel(reviewed)}
      </span>
      <button
        type="button"
        onClick={onMark}
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium [@media(pointer:coarse)]:min-h-11 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
      >
        <CheckCheck className="size-3.5 text-muted-foreground" aria-hidden /> {t("Marcar como conferida")}
      </button>
    </div>
  );
}
