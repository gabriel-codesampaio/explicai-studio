import { HEADING_SLOTS, type HeadingSlot, type ManualTheme } from "../types.js";
import { contrast, contrastWithWhite, HEX, muted, overWhite, withAlpha } from "./color.js";
import {
  DEFAULT_HEADINGS_FONT,
  DEFAULT_TEXT_FONT,
  FONTS,
  type FontSpec,
  fontById,
  fontFaceCss,
  fontStack,
  MONO,
} from "./fonts.js";

/** Contraste mínimo do texto com o fundo (WCAG AA). */
export const MIN_CONTRAST = 4.5;

/** Valores de hoje: o manual sem `theme` exporta com estes. */
export const DEFAULT_TEXT = "#151a33";
export const DEFAULT_ACCENT = "#2b4fe0";
export const DEFAULT_HIGHLIGHT = "#ffd43b";
/** Opacidade do marca-texto sobre o papel (a mesma do CSS do export). */
const HIGHLIGHT_ALPHA = 0.55;

const SLOT_NAMES: Record<HeadingSlot, string> = {
  cover: "título da capa",
  page: "título da página",
  h1: "título de nível 1",
  h2: "título de nível 2",
  h3: "título de nível 3",
};

/** Mudança no tema: campo ausente fica como está, `null` apaga o campo. */
export type ThemePatch = Partial<Record<"accent" | "text" | "highlight", string | null>> & {
  headings?: Partial<Record<HeadingSlot, string | null>> | null;
  fonts?: Partial<Record<"text" | "headings", string | null>> | null;
};

const num = (n: number) => n.toFixed(1).replace(".", ",");

function hexOf(value: unknown, label: string): string | null {
  if (value === null) return null;
  if (typeof value !== "string" || !HEX.test(value)) throw new Error(`Cor inválida em ${label}: use o formato #2b4fe0.`);
  return value.toLowerCase();
}

function readable(hex: string, label: string): string {
  const c = contrastWithWhite(hex);
  if (c < MIN_CONTRAST) {
    throw new Error(
      `A cor de ${label} tem contraste ${num(c)}:1 com o branco; o mínimo é ${num(MIN_CONTRAST)}:1. Escolha uma cor mais escura.`,
    );
  }
  return hex;
}

/** A fonte da lista com esse nome. O texto precisa de uma com itálico empacotado. */
function fontOf(id: unknown, role: "text" | "headings"): FontSpec {
  const font = typeof id === "string" ? fontById(id) : undefined;
  const valid = FONTS.filter((f) => role === "headings" || f.italic);
  if (!font || !valid.includes(font)) {
    throw new Error(`Fonte fora da lista: ${String(id)}. Use uma destas: ${valid.map((f) => f.id).join(", ")}.`);
  }
  return font;
}

/** As fontes que o tema usa (as da marca, onde não houve escolha). */
export function themeFonts(theme: ManualTheme | undefined): { text: FontSpec; headings: FontSpec } {
  return {
    text: fontById(theme?.fonts?.text ?? DEFAULT_TEXT_FONT) as FontSpec,
    headings: fontById(theme?.fonts?.headings ?? DEFAULT_HEADINGS_FONT) as FontSpec,
  };
}

/** Aplica `patch` sobre o tema atual e confere tudo. Devolve o tema novo; o que não mudou continua igual. */
export function mergeTheme(current: ManualTheme | undefined, patch: ThemePatch): ManualTheme {
  const next: ManualTheme = { ...current, headings: { ...current?.headings }, fonts: { ...current?.fonts } };
  const set = (key: "accent" | "text" | "highlight", label: string, check: boolean) => {
    if (patch[key] === undefined) return;
    const hex = hexOf(patch[key], label);
    if (hex === null) delete next[key];
    else next[key] = check ? readable(hex, label) : hex;
  };
  set("accent", "destaque", true);
  set("text", "texto", true);
  set("highlight", "realce", false);

  if (patch.headings === null) next.headings = {};
  else if (patch.headings) {
    for (const slot of HEADING_SLOTS) {
      const value = patch.headings[slot];
      if (value === undefined) continue;
      const hex = hexOf(value, SLOT_NAMES[slot]);
      if (hex === null) delete next.headings?.[slot];
      else if (next.headings) next.headings[slot] = readable(hex, SLOT_NAMES[slot]);
    }
  }
  if (patch.fonts === null) next.fonts = {};
  else if (patch.fonts) {
    for (const role of ["text", "headings"] as const) {
      const id = patch.fonts[role];
      if (id === undefined) continue;
      if (id === null) delete next.fonts?.[role];
      else if (next.fonts) next.fonts[role] = fontOf(id, role).id;
    }
  }
  // O realce é fundo: o texto por cima precisa continuar legível.
  if (next.highlight) {
    const c = contrast(overWhite(next.highlight, HIGHLIGHT_ALPHA), next.text ?? DEFAULT_TEXT);
    if (c < MIN_CONTRAST) {
      throw new Error(
        `O texto sobre o realce tem contraste ${num(c)}:1; o mínimo é ${num(MIN_CONTRAST)}:1. Escolha um realce mais claro.`,
      );
    }
  }
  if (!Object.keys(next.headings ?? {}).length) delete next.headings;
  if (!Object.keys(next.fonts ?? {}).length) delete next.fonts;
  return next;
}

/** Variáveis CSS do tema, só as que mudam. Vazio quando o manual usa as cores da marca. */
export function themeCss(theme: ManualTheme | undefined): string {
  if (!theme) return "";
  const v: string[] = [];
  if (theme.accent)
    v.push(`--accent:${theme.accent}`, `--anotacao:${theme.accent}`, `--anotacao-fundo:${withAlpha(theme.accent, 0.08)}`);
  if (theme.text) v.push(`--tinta:${theme.text}`, `--grafite:${muted(theme.text)}`);
  if (theme.highlight) {
    v.push(
      `--marca:${theme.highlight}`,
      `--marca-faixa:${withAlpha(theme.highlight, HIGHLIGHT_ALPHA)}`,
      `--marca-halo:${withAlpha(theme.highlight, 0.3)}`,
    );
  }
  for (const slot of HEADING_SLOTS) if (theme.headings?.[slot]) v.push(`--t-${slot}:${theme.headings[slot]}`);
  const fonts = themeFonts(theme);
  if (theme.fonts?.text) v.push(`--texto:${fontStack(fonts.text)}`);
  if (theme.fonts?.headings) v.push(`--display:${fontStack(fonts.headings)}`);
  return v.length ? `:root{${v.join(";")}}` : "";
}

/** As fontes que vão no export: texto, títulos (sem repetir) e a de código. */
export function usedFonts(theme: ManualTheme | undefined): FontSpec[] {
  const { text, headings } = themeFonts(theme);
  return [...new Set([text, headings, MONO])];
}

/** `@font-face` das fontes usadas, no mesmo formato do export. */
export const fontFacesCss = (theme: ManualTheme | undefined): string => usedFonts(theme).map(fontFaceCss).join("\n");
