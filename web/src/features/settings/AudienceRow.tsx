import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api";
import { audienceNameError, MAX_AUDIENCE_NAME } from "@/lib/audiences";
import { t, tn } from "@/lib/i18n";

interface Props {
  name: string;
  count: number;
  known: string[];
  onRename: (name: string) => Promise<void>;
  onRemove: () => void;
}

const TOUCH = "[@media(pointer:coarse)]:min-h-11";

/** Uma linha da lista de públicos: nome, páginas e ações. Renomear acontece na própria linha (Enter grava, Esc cancela). */
export function AudienceRow({ name, count, known, onRename, onRemove }: Props) {
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const stop = () => {
    setValue(null);
    setError(null);
  };
  const save = async () => {
    if (value === null || busy) return;
    if (value.trim() === name) return stop();
    const refused = audienceNameError(value, known, name);
    if (refused) return setError(refused);
    setBusy(true);
    try {
      await onRename(value.trim());
      stop();
    } catch (err) {
      setError(errorMessage(err));
    }
    setBusy(false);
  };
  const errorId = `aud-err-${name}`.replace(/\s/g, "_");

  return (
    <li className="grid gap-1 py-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {value === null ? (
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
        ) : (
          <Input
            autoFocus
            value={value}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void save();
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                stop();
              }
            }}
            maxLength={MAX_AUDIENCE_NAME + 10}
            aria-label={t("Novo nome de {nome}", { nome: name })}
            aria-invalid={error !== null}
            aria-describedby={error ? errorId : undefined}
            className={`min-w-0 flex-1 ${TOUCH}`}
          />
        )}
        <span className="font-mono text-xs text-muted-foreground">{tn(count, "{n} página", "{n} páginas")}</span>
        {value === null ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className={TOUCH}
              aria-label={t("Renomear {nome}", { nome: name })}
              onClick={() => setValue(name)}
            >
              {t("Renomear")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={TOUCH}
              aria-label={t("Remover {nome}", { nome: name })}
              onClick={onRemove}
            >
              {t("Remover")}
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" className={TOUCH} disabled={busy} onClick={() => void save()}>
              {t("Salvar")}
            </Button>
            <Button variant="ghost" size="sm" className={TOUCH} disabled={busy} onClick={stop}>
              {t("Cancelar")}
            </Button>
          </>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </li>
  );
}
