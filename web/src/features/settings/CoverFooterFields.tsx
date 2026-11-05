import { useEffect, useState } from "react";
import { useStudioContext } from "@/hooks/StudioContext";
import { errorMessage, type ManualCover } from "@/lib/api";
import { COVER_FIELDS, COVER_MAX, coverLines, FOOTER_MAX, suggestDate } from "@/lib/cover";
import { locale, t } from "@/lib/i18n";

type Draft = Required<ManualCover> & { text: string };

const FIELDS = {
  subtitle: { label: t("Subtítulo"), hint: t("Ex.: Para: Acme") },
  author: { label: t("Autor ou equipe"), hint: t("Ex.: Time de Finanças") },
  version: { label: t("Versão"), hint: t("Ex.: Versão 2.1") },
  date: { label: t("Data"), hint: t("Ex.: outubro de 2026") },
} as const;

/** Capa e rodapé do HTML e do PDF (T-147). Cada campo salva ao sair dele; a prévia acompanha a digitação. */
export function CoverFooterFields() {
  const studio = useStudioContext();
  const manual = studio.manual;
  const saved: Draft = { subtitle: "", author: "", version: "", date: "", text: "", ...manual?.cover, ...manual?.footer };
  const [draft, setDraft] = useState<Draft>(saved);
  const [error, setError] = useState<string | null>(null);
  const key = JSON.stringify(saved);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` resume `saved`; só recarrega quando o disco muda.
  useEffect(() => setDraft(saved), [key]);
  if (!manual) return null;

  const run = (job: Promise<void>) =>
    job.then(
      () => setError(null),
      (err: unknown) => {
        setError(errorMessage(err));
        setDraft(saved);
      },
    );
  const saveField = (k: keyof ManualCover, value: string) =>
    value.trim() === saved[k] ? undefined : run(studio.setManualCover({ [k]: value }));
  const saveText = (value: string) => (value.trim() === saved.text ? undefined : run(studio.setManualFooter({ text: value })));
  const suggestions: Partial<Record<keyof ManualCover, string>> = { version: t("Versão 1.0"), date: suggestDate(locale) };

  return (
    <section className="grid gap-3" aria-labelledby="aparencia-capa">
      <h3 id="aparencia-capa" className="rotulo">
        {t("Capa e rodapé")}
      </h3>
      <div className="grid gap-2.5">
        {COVER_FIELDS.map((k) => (
          <TextField
            key={k}
            label={FIELDS[k].label}
            placeholder={FIELDS[k].hint}
            value={draft[k]}
            max={COVER_MAX}
            onChange={(v) => setDraft({ ...draft, [k]: v })}
            onCommit={(v) => void saveField(k, v)}
            suggestion={suggestions[k]}
          />
        ))}
        <TextField
          label={t("Texto do rodapé")}
          placeholder={t("Ex.: Confidencial · Acme")}
          value={draft.text}
          max={FOOTER_MAX}
          onChange={(v) => setDraft({ ...draft, text: v })}
          onCommit={(v) => void saveText(v)}
        />
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={manual.footer?.pageNumbers === true}
            onChange={(e) => void run(studio.setManualFooter({ pageNumbers: e.target.checked ? true : null }))}
            className="size-4 accent-[var(--primary)]"
          />
          <span>{t("Numerar as páginas do PDF")}</span>
        </label>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
      <fieldset aria-label={t("Prévia da capa e do rodapé")} className="grid min-w-0 gap-2 border-0 p-0">
        <div className="rounded-md border border-border bg-white p-4 text-[#151a33]">
          <p className="font-display text-lg font-extrabold leading-tight">{manual.title}</p>
          {coverLines(draft).map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: linhas podem repetir (versão igual à data); a lista só é recriada inteira.
            <p key={i} className="mt-1 whitespace-pre-line break-words text-xs text-[#575e78]">
              {line}
            </p>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-x-4 rounded-md border border-border bg-white px-4 py-2 text-[11px] text-[#575e78]">
          <span className="min-w-0 whitespace-pre-line break-words">{draft.text.trim()}</span>
          {manual.footer?.pageNumbers && <span className="ml-auto">2 / 8</span>}
        </div>
        <p className="text-xs text-muted-foreground">
          {t("A capa não leva rodapé. O número de página só sai no PDF e pede Chrome 131 ou mais novo.")}
        </p>
      </fieldset>
    </section>
  );
}

interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  max: number;
  onChange: (value: string) => void;
  onCommit: (value: string) => void;
  /** Texto que a pessoa aceita com um clique; só aparece com o campo vazio. */
  suggestion?: string;
}

function TextField({ label, placeholder, value, max, onChange, onCommit, suggestion }: FieldProps) {
  const size = [...value].length;
  return (
    <div className="grid gap-1 text-sm">
      <label className="grid gap-1">
        <span className="font-bold">{label}</span>
        <input
          type="text"
          value={value}
          maxLength={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onCommit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onCommit(e.currentTarget.value)}
          className="h-9 min-w-0 rounded-sm border border-input bg-transparent px-2"
        />
      </label>
      {size >= max * 0.8 && (
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {size} / {max}
        </span>
      )}
      {suggestion && !value.trim() && (
        <button
          type="button"
          onClick={() => {
            onChange(suggestion);
            onCommit(suggestion);
          }}
          className="min-h-11 w-fit rounded-sm px-2 text-xs text-primary hover:bg-accent"
        >
          {t("Usar {texto}", { texto: suggestion })}
        </button>
      )}
    </div>
  );
}
