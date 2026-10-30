import type { Token, Tokens } from "marked";

/** Cor de cada tipo de alerta no manual exportado (fundo branco). O de `note` segue a cor de destaque do manual. */
export const CALLOUT_COLORS: Record<string, string> = {
  tip: "#17793a",
  warning: "#b04a00",
  caution: "#c3261b",
  note: "#2b4fe0",
};

const MARKER = /^\[!(TIP|WARNING|CAUTION|NOTE)\][ \t]*\n?/i;

/**
 * Alerta GFM (`> [!TIP]` na primeira linha da citação): devolve o tipo e o corpo sem o marcador.
 * Qualquer outra citação, inclusive `[!IMPORTANT]`, volta null e sai como citação comum.
 */
export function readCallout(tokens: Token[]): { type: string; body: Token[] } | null {
  const [first, ...rest] = tokens;
  if (first?.type !== "paragraph") return null;
  const [lead, ...more] = (first as Tokens.Paragraph).tokens;
  const m = lead?.type === "text" ? MARKER.exec(lead.raw) : null;
  if (!lead || !m?.[1]) return null;
  const left = lead.raw.slice(m[0].length);
  const inline = left ? [{ ...lead, raw: left, text: left }, ...more] : more;
  const body = inline.length ? [{ ...first, tokens: inline } as Token, ...rest] : rest;
  return { type: m[1].toLowerCase(), body };
}
