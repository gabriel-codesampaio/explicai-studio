import type { Page, PagePatch } from "./api";

export interface ConflictDiff {
  /** Trecho do arquivo no disco que difere do texto da pessoa. */
  disk: string;
  /** Trecho do texto da pessoa que difere do disco. */
  mine: string;
  /** Quantas linhas estão no trecho que difere (o maior dos dois lados). */
  lines: number;
}

/** Tira o começo e o fim iguais e devolve só o miolo que difere; null se os dois textos são iguais. */
export function textDiff(mine: string, disk: string): ConflictDiff | null {
  if (mine === disk) return null;
  const a = mine.split("\n");
  const b = disk.split("\n");
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  return {
    mine: a.slice(start, endA).join("\n"),
    disk: b.slice(start, endB).join("\n"),
    lines: Math.max(endA - start, endB - start),
  };
}

/** O que mudou entre o que a pessoa ia gravar (`pending`) e a página no disco: o corpo, ou o título se só ele mudou. */
export function conflictDiff(pending: PagePatch | undefined, disk: Page): ConflictDiff | null {
  if (!pending) return null;
  const body = pending.body === undefined ? null : textDiff(pending.body, disk.body);
  if (body) return body;
  return pending.title === undefined ? null : textDiff(pending.title, disk.title);
}
