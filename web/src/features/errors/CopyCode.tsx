import { useState } from "react";
import { t } from "@/lib/i18n";

/** Código técnico do erro: discreto, em mono, com botão para copiar e colar num relato. */
export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(code).then(() => setCopied(true));
  };
  return (
    <div className="flex max-w-full items-center gap-2 text-xs text-muted-foreground">
      <code className="min-w-0 truncate font-mono" title={code}>
        {code}
      </code>
      <button
        type="button"
        onClick={copy}
        className="[@media(pointer:coarse)]:min-h-11 shrink-0 rounded-md px-2 font-bold text-primary underline-offset-2 hover:underline"
      >
        {copied ? t("Copiado") : t("Copiar código")}
      </button>
      <span role="status" className="sr-only">
        {copied ? t("Código copiado.") : ""}
      </span>
    </div>
  );
}
