import type { FontInfo } from "@/lib/api";
import { t } from "@/lib/i18n";
import { previewFamily } from "./useFontPreview";

interface Props {
  label: string;
  fonts: FontInfo[];
  /** Fonte escolhida; vazio = a padrão. */
  value: string | undefined;
  fallback: string;
  onChange: (id: string | null) => void;
}

/** Escolha de fonte: cada nome aparece na própria fonte. Escolher a padrão volta ao padrão. */
export function FontPicker({ label, fonts, value, fallback, onChange }: Props) {
  const current = value ?? fallback;
  return (
    <fieldset className="grid gap-1.5">
      <legend className="mb-1 text-sm">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {fonts.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={current === f.id}
            onClick={() => onChange(f.id === fallback ? null : f.id)}
            style={{ fontFamily: `${previewFamily(f.family)}, ${f.kind === "serif" ? "serif" : "sans-serif"}` }}
            className="rounded-md border border-border px-2.5 py-1 text-sm hover:bg-muted aria-pressed:border-primary aria-pressed:bg-accent aria-pressed:font-bold"
          >
            {f.family}
            {f.id === fallback && (
              <span className="font-sans text-[11px] font-normal text-muted-foreground"> · {t("padrão")}</span>
            )}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
