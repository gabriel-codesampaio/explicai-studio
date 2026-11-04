/**
 * Aparência das marcações de uma imagem (`style` no JSON ao lado dela). O editor tem uma cópia em
 * web/src/lib/annotationStyle.ts; test/annotation-style.test.ts garante que as duas são idênticas.
 */
export type StyleColor = "cobalt" | "ink" | "red" | "green" | "purple" | "orange";
export type StyleStep = "s" | "m" | "l";

export interface AnnotationStyle {
  color?: StyleColor;
  size?: StyleStep;
  stroke?: StyleStep;
}

/**
 * Paleta fechada. `claro` serve ao export e ao Studio claro; `escuro`, ao Studio escuro. `sobre` é a cor do
 * número no disco. Todas passam de 4,5:1 (claro contra branco; escuro contra o `sobreEscuro`), medido em
 * test/annotation-style.test.ts. `cobalt` é o azul de sempre.
 */
export const STYLE_PALETTE: Record<StyleColor, { claro: string; sobre: string; escuro: string; sobreEscuro: string }> = {
  cobalt: { claro: "#2b4fe0", sobre: "#ffffff", escuro: "#7088ff", sobreEscuro: "#0e1120" },
  ink: { claro: "#1a1f36", sobre: "#ffffff", escuro: "#c9cfe6", sobreEscuro: "#0e1120" },
  red: { claro: "#c4261d", sobre: "#ffffff", escuro: "#ff8a80", sobreEscuro: "#0e1120" },
  green: { claro: "#1a7a3c", sobre: "#ffffff", escuro: "#5fd68a", sobreEscuro: "#0e1120" },
  purple: { claro: "#7b3fc4", sobre: "#ffffff", escuro: "#b894f0", sobreEscuro: "#0e1120" },
  orange: { claro: "#b24a00", sobre: "#ffffff", escuro: "#ffa14d", sobreEscuro: "#0e1120" },
};

/** Diâmetro do disco do marcador (px) e tamanho do número. `m` é o padrão de sempre. */
export const MARKER_SIZES: Record<StyleStep, { disc: number; font: number }> = {
  s: { disc: 20, font: 12 },
  m: { disc: 24, font: 13 },
  l: { disc: 32, font: 16 },
};

/** Fator sobre a espessura de sempre (seta e contorno de destaque e de área). */
export const STROKE_SCALE: Record<StyleStep, number> = { s: 0.75, m: 1, l: 1.5 };

const isStep = (v: unknown): v is StyleStep => v === "s" || v === "m" || v === "l";

/** Valor inválido é ignorado campo a campo; sem nenhum campo válido, não há `style`. */
export function parseStyle(v: unknown): AnnotationStyle | undefined {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return undefined;
  const r = v as Record<string, unknown>;
  const style: AnnotationStyle = {
    ...(typeof r.color === "string" && Object.hasOwn(STYLE_PALETTE, r.color) ? { color: r.color as StyleColor } : {}),
    ...(isStep(r.size) ? { size: r.size } : {}),
    ...(isStep(r.stroke) ? { stroke: r.stroke } : {}),
  };
  return Object.keys(style).length ? style : undefined;
}

const alpha = (hex: string, a: number) =>
  `rgba(${[1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)).join(",")},${a})`;

/**
 * Variáveis CSS do estilo, só as escolhidas. No export (`adaptive` falso) vale a cor clara; no Studio,
 * `light-dark()` troca sozinho com o tema.
 */
export function styleVars(style: AnnotationStyle | undefined, adaptive = false): Record<string, string> {
  const vars: Record<string, string> = {};
  if (style?.color) {
    const p = STYLE_PALETTE[style.color];
    vars["--anotacao"] = adaptive ? `light-dark(${p.claro},${p.escuro})` : p.claro;
    vars["--sobre-anotacao"] = adaptive ? `light-dark(${p.sobre},${p.sobreEscuro})` : p.sobre;
    vars["--anotacao-fundo"] = alpha(p.claro, 0.08);
  }
  if (style?.size) {
    vars["--disco"] = `${MARKER_SIZES[style.size].disc}px`;
    vars["--disco-fonte"] = `${MARKER_SIZES[style.size].font}px`;
  }
  if (style?.stroke) vars["--marca-espessura"] = String(STROKE_SCALE[style.stroke]);
  return vars;
}
