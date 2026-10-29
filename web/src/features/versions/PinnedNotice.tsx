import { BookCheck } from "lucide-react";
import { t } from "@/lib/i18n";

/**
 * Aviso no topo da página fixada numa versão guardada: o manual final usa aquela versão,
 * então o que se escreve aqui não entra nele até a pessoa voltar para o texto atual.
 */
export function PinnedNotice({ onUseCurrent }: { onUseCurrent: () => void }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border-l-4 border-marca bg-marca/15 px-3 py-2 text-sm">
      <BookCheck className="hidden size-4 shrink-0 sm:block" aria-hidden />
      <p className="min-w-0 flex-1 basis-60">
        {t(
          "O manual final usa uma versão guardada desta página. O que você escrever aqui só entra no manual quando você voltar para o texto atual.",
        )}
      </p>
      <button
        type="button"
        onClick={onUseCurrent}
        className="shrink-0 rounded-md px-2 py-1 font-bold text-primary hover:bg-accent"
      >
        {t("Usar o texto atual")}
      </button>
    </div>
  );
}
