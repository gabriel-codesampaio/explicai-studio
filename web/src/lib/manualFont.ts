import type { CSSProperties } from "react";
import type { FontInfo, ManualTheme } from "./api";

/** Prefixo do nome das fontes de prévia: não mexe nas fontes do próprio Studio. */
export const previewFamily = (family: string) => `"Explicaí prévia ${family}"`;

const stack = (f: FontInfo) => `${previewFamily(f.family)}, ${f.kind === "serif" ? "serif" : "sans-serif"}`;

/** Fonte do manual (`theme.fonts`) como estilo do editor. Só o conteúdo muda; o resto do Studio fica na fonte da marca. */
export function manualFontStyle(fonts: FontInfo[], theme: ManualTheme | undefined): CSSProperties {
  const text = fonts.find((f) => f.id === theme?.fonts?.text && f.italic);
  const headings = fonts.find((f) => f.id === theme?.fonts?.headings);
  return {
    ...(text && { fontFamily: stack(text) }),
    ...(headings && { "--fonte-display": stack(headings) }),
  };
}
