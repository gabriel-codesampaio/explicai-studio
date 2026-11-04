import { Check, Trash2 } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import {
  type AnnotationStyle,
  HIGHLIGHT_PALETTE,
  type HighlightColor,
  resolveItemStyle,
  STYLE_PALETTE,
  type StyleBorder,
  type StyleColor,
  type StyleItemKind,
} from "@/lib/annotationStyle";
import { t } from "@/lib/i18n";
import { option } from "./AppearancePanel";
import { BORDERS, COLORS, FILLS, HIGHLIGHT_COLORS, SIZES, STROKES } from "./styleOptions";

type Field = keyof AnnotationStyle;
/** Campos do tipo; espelha o que o formato aceita por item. */
const FIELDS: Record<StyleItemKind, Field[]> = {
  marker: ["color", "size", "border"],
  arrow: ["color", "stroke", "border"],
  highlight: ["color", "border", "fill"],
  hotspot: ["color", "border", "fill"],
};

interface Props {
  kind: StyleItemKind;
  /** Nome do item, ex. "Marcador 2". */
  name: string;
  style: AnnotationStyle | undefined;
  /** Estilo da imagem: o que o item herda. */
  imageStyle: AnnotationStyle | undefined;
  /** `undefined` apaga o `style` do item. */
  onChange: (style: AnnotationStyle | undefined) => void;
  onDelete: () => void;
}

/** Estilo do item selecionado. Cada campo mostra o valor que vale (do item, da imagem ou o padrão de sempre). */
export function ItemStylePanel({ kind, name, style, imageStyle, onChange, onDelete }: Props) {
  const fields = FIELDS[kind];
  // Sem preenchimento e sem borda a área some: resolveItemStyle devolve a borda a `s`.
  const set = (patch: AnnotationStyle) => onChange(resolveItemStyle({ ...style, ...patch }, imageStyle));
  const hl = kind === "highlight";
  const colors = hl ? HIGHLIGHT_COLORS : COLORS;
  const swatch = (id: StyleColor | HighlightColor) =>
    hl
      ? { background: HIGHLIGHT_PALETTE[id as HighlightColor].fill, color: "#151a33" }
      : { background: STYLE_PALETTE[id as StyleColor].claro, color: STYLE_PALETTE[id as StyleColor].sobre };
  const color: StyleColor | HighlightColor | undefined = hl ? style?.color : (style?.color ?? imageStyle?.color ?? "cobalt");
  const border: StyleBorder = style?.border ?? imageStyle?.border ?? "m";
  // Destaque sem fill herda o visual do tema (multiply): nenhum botão marcado.
  const fill = style?.fill ?? (hl ? undefined : "soft");

  const steps = (
    key: "size" | "stroke" | "border" | "fill",
    legend: string,
    items: { id: string; label: () => string }[],
    value: string,
    disabled?: (id: string) => boolean,
    hint?: string,
  ) => (
    <fieldset className="flex items-center gap-2">
      <legend className="sr-only">{legend}</legend>
      <span aria-hidden className="w-24 shrink-0 text-sm font-bold">
        {legend}
      </span>
      <div className="flex flex-wrap gap-1">
        {items.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={value === s.id}
            disabled={disabled?.(s.id)}
            title={disabled?.(s.id) ? hint : undefined}
            onClick={() => set({ [key]: s.id })}
            className={`${option} px-2 disabled:opacity-50`}
          >
            {s.label()}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <section
      data-style-panel
      tabIndex={-1}
      className="grid gap-2.5 rounded-md border border-border p-3 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      aria-label={t("Estilo do item")}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="rotulo">
          {t("Estilo")} · {name}
        </h3>
        {style && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="min-h-7 rounded-md px-1 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [@media(pointer:coarse)]:min-h-11"
          >
            {t("Voltar ao padrão")}
          </button>
        )}
      </div>
      {fields.includes("color") && (
        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">{t("Cor")}</legend>
          <span aria-hidden className="w-24 shrink-0 text-sm font-bold">
            {t("Cor")}
          </span>
          <div className="flex gap-1.5">
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
                title={c.label()}
                aria-label={c.label()}
                aria-pressed={color === c.id}
                onClick={() => set({ color: c.id })}
                style={swatch(c.id)}
                className="grid size-7 shrink-0 place-items-center rounded-full border border-border focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:ring-2 aria-pressed:ring-primary aria-pressed:ring-offset-2 [@media(pointer:coarse)]:size-11"
              >
                {color === c.id && <Check className="size-4" aria-hidden />}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {fields.includes("size") && steps("size", t("Tamanho"), SIZES, style?.size ?? "m")}
      {fields.includes("stroke") && steps("stroke", t("Espessura"), STROKES, style?.stroke ?? "m")}
      {fields.includes("fill") && steps("fill", t("Preenchimento"), FILLS, fill ?? "")}
      {fields.includes("border") &&
        steps(
          "border",
          t("Borda"),
          BORDERS,
          border,
          (id) => id === "none" && (kind === "hotspot" || hl) && fill === "none",
          t("Sem preenchimento precisa de borda"),
        )}
      <button
        type="button"
        onClick={onDelete}
        aria-label={t("Excluir {nome}", { nome: name.toLowerCase() })}
        className="flex min-h-8 items-center gap-1.5 justify-self-start rounded-md border border-border px-2 text-sm text-destructive hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 [@media(pointer:coarse)]:min-h-11"
      >
        <Trash2 className="size-4" aria-hidden />
        {t("Excluir")}
        <Kbd>Del</Kbd>
      </button>
      {!style && <p className="text-xs text-muted-foreground">{t("Herdando da imagem")}</p>}
    </section>
  );
}
