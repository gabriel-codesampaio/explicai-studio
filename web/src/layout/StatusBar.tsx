import { AlertCircle, Check, Loader2 } from "lucide-react";
import type { SaveState } from "@/hooks/useAutosave";
import { locale, t } from "@/lib/i18n";

interface Props {
  /** Caminho do arquivo da página dentro do workspace, ex.: financeiro/pages/clientes.md */
  path: string;
  state: SaveState;
  savedAt: Date | null;
  onRetry: () => void;
}

const time = (d: Date) => d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

/**
 * Rodapé da página: mostra o arquivo Markdown que está sendo editado e o estado do salvamento.
 * É a prova de que o manual é uma pasta de arquivos e de que nada se perdeu.
 */
export function StatusBar({ path, state, savedAt, onRetry }: Props) {
  return (
    <footer className="sticky bottom-0 z-10 flex items-center justify-between gap-4 border-t border-border bg-background/95 px-8 py-2 text-[13px] backdrop-blur-sm">
      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
        <span className="truncate font-mono text-xs" title={path}>
          {path}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5" role="status" aria-live="polite">
        {state === "saving" && (
          <>
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden /> {t("Salvando…")}
          </>
        )}
        {state === "saved" && savedAt && (
          <>
            <Check className="size-3.5 text-primary" aria-hidden /> {t("Salvo às {hora}", { hora: time(savedAt) })}
          </>
        )}
        {state === "idle" && <span className="text-muted-foreground">{t("Tudo salvo no disco")}</span>}
        {state === "error" && (
          <>
            <AlertCircle className="size-3.5 text-destructive" aria-hidden />
            <span className="text-destructive">{t("Não foi possível salvar.")}</span>
            <button type="button" onClick={onRetry} className="font-bold text-primary underline-offset-2 hover:underline">
              {t("Tentar de novo")}
            </button>
          </>
        )}
      </span>
    </footer>
  );
}
