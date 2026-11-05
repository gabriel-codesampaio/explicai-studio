import { t } from "@/lib/i18n";

/**
 * Selo da página fixada, logo abaixo do título: o manual final usa a versão guardada, então o que se
 * escreve aqui só entra nele quando a pessoa volta ao texto atual.
 */
export function PinnedNotice({ onUseCurrent }: { onUseCurrent: () => void }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[13px]">
      <span className="rounded-sm bg-marca px-1.5 py-0.5 text-xs font-bold whitespace-nowrap text-[#151a33]">
        {t("Fixada no manual")}
      </span>
      <button
        type="button"
        onClick={onUseCurrent}
        className="rounded-sm font-bold whitespace-nowrap text-primary underline underline-offset-2 hover:no-underline [@media(pointer:coarse)]:min-h-11"
      >
        {t("Usar texto atual")}
      </button>
    </div>
  );
}
