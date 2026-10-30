import { EmptyState } from "@/components/EmptyState";
import { t } from "@/lib/i18n";
import { CopyCode } from "./CopyCode";

interface Props {
  error: { name: string; message: string };
  /** Tenta mostrar a tela de novo, sem recarregar. Falta quando a falha foi na raiz. */
  onRetry?: () => void;
  /** Texto e ação próprios, para falhas que não são de renderização (ex.: não abriu o manual). */
  title?: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

/** Erro inesperado. Recarregar é a saída padrão: o que já foi salvo continua no disco. */
export function CrashScreen({ error, onRetry, title, message, action }: Props) {
  return (
    <div className="h-full overflow-y-auto">
      <EmptyState
        alert
        title={title ?? t("Algo quebrou nesta tela")}
        action={action ?? { label: t("Recarregar o Studio"), onClick: () => window.location.reload() }}
        extra={
          <>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="[@media(pointer:coarse)]:min-h-11 rounded-md px-1 font-bold text-primary underline-offset-2 hover:underline"
              >
                {t("Tentar de novo sem recarregar")}
              </button>
            )}
            <CopyCode code={`${error.name}: ${error.message}`} />
          </>
        }
      >
        {message ??
          t(
            "O Studio encontrou um erro que não esperava. O texto que já foi salvo continua no disco. Recarregue para continuar; se o erro voltar, copie o código abaixo e conte para quem mantém o projeto.",
          )}
      </EmptyState>
    </div>
  );
}
