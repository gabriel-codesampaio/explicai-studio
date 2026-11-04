import type { TreeItem } from "./api";
import { t } from "./i18n";
import { flattenItems } from "./tree";

export const MAX_AUDIENCE_NAME = 40;

export interface AudienceUsage {
  /** Páginas que citam o público. */
  count: number;
  /** Títulos das que só têm ele: ao remover, passam a aparecer para todos. */
  freed: string[];
}

/** Uso do público nas páginas já carregadas (sem rota nova). */
export function audienceUsage(pages: TreeItem[], name: string): AudienceUsage {
  const used = flattenItems(pages).filter((p) => p.audience?.includes(name));
  return { count: used.length, freed: used.filter((p) => p.audience?.length === 1).map((p) => p.title || t("Sem título")) };
}

/** Motivo de recusar o nome (já traduzido), ou null. `except` é o nome que está sendo renomeado. */
export function audienceNameError(raw: string, known: string[], except?: string): string | null {
  const name = raw.trim();
  if (!name) return t("Dê um nome ao público.");
  if (name.length > MAX_AUDIENCE_NAME) return t("O nome do público tem no máximo {max} caracteres.", { max: MAX_AUDIENCE_NAME });
  const low = name.toLocaleLowerCase();
  if (known.some((a) => a !== except && a.toLocaleLowerCase() === low))
    return t("Já existe um público chamado {name}.", { name });
  return null;
}
