import { useState } from "react";
import { t } from "@/lib/i18n";

/** Código técnico do erro: discreto, em mono, com botão para copiar e colar num relato. */
export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(code).then(() => setCopied(true));
  };
  return (
    <div className="mt-2 flex max-w-full items-center gap-1 rounded-[3px] border border-dashed border-border py-0.5 pr-1 pl-3 text-xs text-muted-foreground">
      <code className="min-w-0 py-1.5 font-mono break-words">{code}</code>
      <button
        type="button"
        onClick={copy}
        className="[@media(pointer:coarse)]:min-h-11 shrink-0 rounded-md px-2 py-1.5 font-bold text-primary underline-offset-2 hover:underline"
      >
        {copied ? t("Copiado") : t("Copiar código")}
      </button>
      <span role="status" className="sr-only">
        {copied ? t("Código copiado.") : ""}
      </span>
    </div>
  );
}
