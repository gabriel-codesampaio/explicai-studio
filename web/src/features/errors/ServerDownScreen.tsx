import { ErrorPage } from "@/components/ErrorPage";
import { t } from "@/lib/i18n";

interface Props {
  attempt: number;
  checking: boolean;
  onRetry: () => void;
  /** Código técnico (ex.: "HTTP 502"). */
  code: string;
}

/** Abertura do Studio com o servidor fora. A reconexão é automática; o botão só adianta a próxima tentativa. */
export function ServerDownScreen({ attempt, checking, onRetry, code }: Props) {
  return (
    <ErrorPage
      title={t("O Studio *não está respondendo*")}
      action={{ label: t("Tentar agora"), onClick: onRetry }}
      technical={code}
      status={checking ? t("Tentando de novo…") : t("Tentamos de novo sozinhos. Tentativas até agora: {n}.", { n: attempt })}
    >
      {t(
        "O servidor do Studio foi fechado ou está reiniciando. Quando ele voltar, esta tela abre o Studio sozinha. Se você usa o terminal, confira se o comando explicai ainda está rodando.",
      )}
    </ErrorPage>
  );
}
