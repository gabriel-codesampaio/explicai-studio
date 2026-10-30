import { Info, Lightbulb, type LucideIcon, OctagonX, TriangleAlert } from "lucide-react";
import type { CalloutType } from "./callout";

/** Ícone de cada tipo de alerta: o do menu e o do painel no editor. */
export const CALLOUT_ICONS: Record<CalloutType, LucideIcon> = {
  tip: Lightbulb,
  warning: TriangleAlert,
  caution: OctagonX,
  note: Info,
};
