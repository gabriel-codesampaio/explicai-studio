import type { Tool } from "./annotations";

/** Letra de cada ferramenta de marcação. Única fonte: a barra e a lista de Atalhos leem daqui. */
export const TOOL_KEYS: Record<Tool, string> = { select: "V", marker: "M", highlight: "D", arrow: "S", hotspot: "A" };

interface KeyLike {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  target?: EventTarget | null;
}

const FIELD = "input, textarea, select, [contenteditable]:not([contenteditable=false])";

/** Ferramenta da tecla apertada, ou null se não for atalho (outra tecla, com Ctrl/Alt/Meta ou dentro de um campo). */
export function toolForKey(e: KeyLike): Tool | null {
  if (e.ctrlKey || e.altKey || e.metaKey) return null;
  if (e.target instanceof Element && e.target.closest(FIELD)) return null;
  const letter = e.key.toUpperCase();
  return (Object.keys(TOOL_KEYS) as Tool[]).find((tool) => TOOL_KEYS[tool] === letter) ?? null;
}
