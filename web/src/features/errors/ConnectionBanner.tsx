import { WifiOff } from "lucide-react";
import { t } from "@/lib/i18n";

interface Props {
  checking: boolean;
  onRetry: () => void;
}

/** Com o Studio aberto e o servidor fora: o texto fica no editor e o salvamento volta sozinho. */
export function ConnectionBanner({ checking, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-l-4 border-border border-l-destructive bg-card px-4 py-1 text-sm"
    >
      <WifiOff className="size-4 shrink-0 text-destructive" aria-hidden />
      <span className="min-w-0 flex-1 basis-64">
        <strong>{t("Sem conexão com o Studio.")}</strong>{" "}
        {t("O que você escreveu continua nesta tela e será salvo quando o servidor voltar.")}
      </span>
      <button
        type="button"
        onClick={onRetry}
        disabled={checking}
        className="[@media(pointer:coarse)]:min-h-11 rounded-md px-2 font-bold text-primary underline-offset-2 hover:underline disabled:opacity-60"
      >
        {checking ? t("Tentando de novo…") : t("Tentar agora")}
      </button>
    </div>
  );
}
