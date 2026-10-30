/**
 * Cor do texto no manual exportado (fundo branco), pelo nome salvo em `<span data-color="…">`.
 * Os mesmos nomes estão no editor (web/src/features/editor/textColor.ts), com a cor de cada tema em tokens.css.
 */
export const TEXT_COLORS: Record<string, string> = {
  gray: "#5c6478",
  red: "#c3261b",
  orange: "#b04a00",
  green: "#17793a",
  blue: "#1f58d6",
  purple: "#7a3cc8",
};

/** `<span data-color="red">`, só com nome da paleta. Devolve o nome ou null. */
export function colorSpanOpen(html: string): string | null {
  const name = /^<span data-color="([a-z]+)">$/.exec(html)?.[1];
  return name && Object.hasOwn(TEXT_COLORS, name) ? name : null;
}
