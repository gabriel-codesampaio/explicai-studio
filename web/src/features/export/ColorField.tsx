import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";

const HEX = /^#[0-9a-f]{6}$/i;

interface Props {
  label: string;
  /** Cor escolhida; vazio = a padrão. */
  value: string | undefined;
  fallback: string;
  /** Recebe o hexadecimal, ou `null` para voltar ao padrão. Recusa (lança) se o core não aceitar a cor. */
  onCommit: (hex: string | null) => Promise<void>;
}

/** Uma cor do manual: seletor, campo hexadecimal e "Padrão". Salva ao sair do campo. */
export function ColorField({ label, value, fallback, onCommit }: Props) {
  const shown = value ?? fallback;
  const [text, setText] = useState(shown);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setText(shown), [shown]);

  const commit = async (next: string | null) => {
    if (next !== null && !HEX.test(next)) {
      setError(t("Use o formato #2b4fe0."));
      return;
    }
    if ((next ?? fallback).toLowerCase() === shown.toLowerCase()) return setError(null);
    try {
      await onCommit(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Não foi possível salvar a cor."));
      setText(shown);
    }
  };

  return (
    <div className="grid gap-1">
      <div className="flex items-center gap-2 text-sm">
        <input
          type="color"
          aria-label={label}
          value={HEX.test(text) ? text.toLowerCase() : shown}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => void commit(e.target.value)}
          className="size-7 shrink-0 cursor-pointer rounded-sm border border-muted-foreground bg-transparent p-0.5"
        />
        <span className="min-w-0 flex-1">{label}</span>
        <input
          type="text"
          aria-label={`${label}: ${t("código da cor")}`}
          value={text}
          maxLength={7}
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => void commit(text)}
          onKeyDown={(e) => e.key === "Enter" && void commit(text)}
          className="h-7 w-24 rounded-sm border border-input bg-transparent px-2 font-mono text-xs aria-invalid:border-destructive"
        />
        <button
          type="button"
          disabled={value === undefined}
          onClick={() => void commit(null)}
          className="rounded-sm px-1.5 py-0.5 text-xs text-primary hover:bg-accent disabled:invisible"
        >
          {t("Padrão")}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
