import { t } from "@/lib/i18n";

/**
 * Linha discreta sob o caminho da página com Versão do manual: o manual final usa aquela versão,
 * então o que se escreve aqui não entra nele até a pessoa voltar para o texto atual.
 */
export function PinnedNotice({ onUseCurrent }: { onUseCurrent: () => void }) {
  return (
    <p className="mt-2 text-sm text-muted-foreground">
      {t(
        "O manual final usa a Versão do manual desta página. O que você escrever aqui só entra nele quando você voltar para o texto atual.",
      )}{" "}
      <button
        type="button"
        onClick={onUseCurrent}
        className="rounded-sm font-bold text-primary underline underline-offset-2 hover:no-underline"
      >
        {t("Usar o texto atual")}
      </button>
    </p>
  );
}
