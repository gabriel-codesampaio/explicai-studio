import { ErrorPage } from "@/components/ErrorPage";
import { errorMessage } from "@/lib/api";
import { errorKind, technicalCode } from "@/lib/errorPages";
import { t } from "@/lib/i18n";

interface Props {
  error: unknown;
  /** O que a pessoa estava abrindo falhou: tenta de novo. */
  onRetry: () => void;
}

/** O servidor respondeu com erro ao abrir o Studio ou um manual: 403 (acesso só local) ou 500. */
export function RequestErrorScreen({ error, onRetry }: Props) {
  const forbidden = errorKind(error) === "forbidden";
  return (
    <ErrorPage
      title={forbidden ? t("O Studio só abre *neste computador*") : t("O servidor *não conseguiu responder*")}
      action={{ label: t("Tentar de novo"), onClick: onRetry }}
      technical={technicalCode(error)}
    >
      {forbidden
        ? t("O Studio só aceita pedidos deste computador. Abra-o por localhost ou 127.0.0.1.")
        : `${errorMessage(error, t("Algo deu errado."))} ${t("Se continuar, feche o comando explicai no terminal e rode de novo.")}`}
    </ErrorPage>
  );
}
