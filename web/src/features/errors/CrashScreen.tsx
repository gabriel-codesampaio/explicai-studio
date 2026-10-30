import { ErrorPage } from "@/components/ErrorPage";
import { t } from "@/lib/i18n";

interface Props {
  error: { name: string; message: string };
  /** Tenta mostrar a tela de novo, sem recarregar. Falta quando a falha foi na raiz. */
  onRetry?: () => void;
  /** Falha na raiz: página inteira, com a marca. Na página do manual, a barra lateral continua de pé. */
  standalone?: boolean;
}

/** Erro inesperado de renderização. Recarregar é a saída padrão: o que já foi salvo continua no disco. */
export function CrashScreen({ error, onRetry, standalone = false }: Props) {
  return (
    <ErrorPage
      standalone={standalone}
      title={t("Algo quebrou *nesta tela*")}
      action={{ label: t("Recarregar o Studio"), onClick: () => window.location.reload() }}
      secondary={onRetry && { label: t("Tentar de novo sem recarregar"), onClick: onRetry }}
      technical={`${error.name}: ${error.message}`}
    >
      {t(
        "O Studio encontrou um erro que não esperava. O texto que já foi salvo continua no disco. Recarregue para continuar; se o erro voltar, copie o código abaixo e conte para quem mantém o projeto.",
      )}
    </ErrorPage>
  );
}
