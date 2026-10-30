import { HEADING_SLOTS, type HeadingSlot, type ManualTheme } from "../types.js";
import { contrast, contrastWithWhite, HEX, muted, overWhite, withAlpha } from "./color.js";

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

/** Aplica `patch` sobre o tema atual e confere tudo. Devolve o tema novo; o que não mudou continua igual. */
export function mergeTheme(current: ManualTheme | undefined, patch: ThemePatch): ManualTheme {
  const next: ManualTheme = { ...current, headings: { ...current?.headings } };
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
  return v.length ? `:root{${v.join(";")}}` : "";
}
