import { type AnnotationStyle, STYLE_PALETTE, type StyleColor, type StyleStep } from "@/lib/annotationStyle";
import { t } from "@/lib/i18n";

const COLORS: { id: StyleColor; label: () => string }[] = [
  { id: "cobalt", label: () => t("Cobalto") },
  { id: "ink", label: () => t("Tinta") },
  { id: "red", label: () => t("Vermelho") },
  { id: "green", label: () => t("Verde") },
  { id: "purple", label: () => t("Roxo") },
  { id: "orange", label: () => t("Laranja") },
];
const SIZES: { id: StyleStep; label: () => string }[] = [
  { id: "s", label: () => t("Pequeno") },
  { id: "m", label: () => t("Médio") },
  { id: "l", label: () => t("Grande") },
];
const STROKES: { id: StyleStep; label: () => string }[] = [
  { id: "s", label: () => t("Fina") },
  { id: "m", label: () => t("Normal") },
  { id: "l", label: () => t("Grossa") },
];

const option =
  "flex min-h-9 items-center gap-1.5 rounded-md border border-border px-2.5 text-sm hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:bg-accent aria-pressed:font-bold [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11";

interface Props {
  style: AnnotationStyle | undefined;
  /** `undefined` volta ao padrão: o campo `style` sai do JSON. */
  onChange: (style: AnnotationStyle | undefined) => void;
}

/** Aparência das marcações desta imagem: cor, tamanho do marcador e espessura. Ausente é o padrão de sempre (cobalto, médio, normal). */
export function AppearancePanel({ style, onChange }: Props) {
  const set = (patch: AnnotationStyle) => onChange({ ...style, ...patch });
  const steps = (key: "size" | "stroke", legend: string, items: { id: StyleStep; label: () => string }[]) => (
    <fieldset className="grid gap-1.5">
      <legend className="mb-1 text-sm font-bold">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={(style?.[key] ?? "m") === s.id}
            onClick={() => set({ [key]: s.id })}
            className={option}
          >
            {s.label()}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <section className="grid gap-3" aria-label={t("Aparência das marcações")}>
      <h3 className="rotulo">{t("Aparência")}</h3>
      <fieldset className="grid gap-1.5">
        <legend className="mb-1 text-sm font-bold">{t("Cor das marcações")}</legend>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={(style?.color ?? "cobalt") === c.id}
              onClick={() => set({ color: c.id })}
              className={option}
            >
              <span
                aria-hidden
                className="size-3.5 shrink-0 rounded-full border border-border"
                style={{ background: STYLE_PALETTE[c.id].claro }}
              />
              {c.label()}
            </button>
          ))}
        </div>
      </fieldset>
      {steps("size", t("Tamanho do marcador"), SIZES)}
      {steps("stroke", t("Espessura da seta e do contorno"), STROKES)}
      {style && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="justify-self-start rounded-md text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [@media(pointer:coarse)]:min-h-11"
        >
          {t("Voltar ao padrão")}
        </button>
      )}
    </section>
  );
}
