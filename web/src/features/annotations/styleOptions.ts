import type { HighlightColor, StyleBorder, StyleColor, StyleFill, StyleStep } from "@/lib/annotationStyle";
import { t } from "@/lib/i18n";

/** Opções dos painéis de estilo (imagem e item). */
export const COLORS: { id: StyleColor; label: () => string }[] = [
  { id: "cobalt", label: () => t("Cobalto") },
  { id: "ink", label: () => t("Tinta") },
  { id: "red", label: () => t("Vermelho") },
  { id: "green", label: () => t("Verde") },
  { id: "purple", label: () => t("Roxo") },
  { id: "orange", label: () => t("Laranja") },
];
export const HIGHLIGHT_COLORS: { id: HighlightColor; label: () => string }[] = [
  { id: "yellow", label: () => t("Amarelo") },
  { id: "green", label: () => t("Verde") },
  { id: "pink", label: () => t("Rosa") },
  { id: "blue", label: () => t("Azul") },
  { id: "orange", label: () => t("Laranja") },
];
export const SIZES: { id: StyleStep; label: () => string }[] = [
  { id: "s", label: () => t("Pequeno") },
  { id: "m", label: () => t("Médio") },
  { id: "l", label: () => t("Grande") },
];
export const STROKES: { id: StyleStep; label: () => string }[] = [
  { id: "s", label: () => t("Fina") },
  { id: "m", label: () => t("Normal") },
  { id: "l", label: () => t("Grossa") },
];
export const BORDERS: { id: StyleBorder; label: () => string }[] = [{ id: "none", label: () => t("Nenhuma") }, ...STROKES];
export const FILLS: { id: StyleFill; label: () => string }[] = [
  { id: "solid", label: () => t("Cheio") },
  { id: "soft", label: () => t("Suave") },
  { id: "none", label: () => t("Sem") },
];
