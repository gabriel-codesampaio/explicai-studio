import type { TreeItem } from "./api";
import { t } from "./i18n";
import { fold } from "./text";

export interface Location {
  parentId: string | null;
  siblings: TreeItem[];
}

export function findItem(items: TreeItem[], id: string): TreeItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    const inner = findItem(item.children, id);
    if (inner) return inner;
  }
  return null;
}

export function locate(items: TreeItem[], id: string, parentId: string | null = null): Location | null {
  for (const item of items) {
    if (item.id === id) return { parentId, siblings: items };
    const inner = locate(item.children, id, item.id);
    if (inner) return inner;
  }
  return null;
}

/** `targetId` está dentro da subárvore de `ancestorId`? */
export function isDescendant(items: TreeItem[], ancestorId: string, targetId: string): boolean {
  const ancestor = findItem(items, ancestorId);
  return ancestor ? findItem(ancestor.children, targetId) !== null : false;
}

export function renameItem(items: TreeItem[], id: string, title: string): TreeItem[] {
  return items.map((i) => (i.id === id ? { ...i, title } : { ...i, children: renameItem(i.children, id, title) }));
}

export type DropZone = "before" | "inside" | "after";

/**
 * Para onde vai a página arrastada ao soltar sobre `targetId`. O índice é calculado sem a página
 * arrastada, porque o servidor a remove antes de inserir. Devolve null quando o movimento não faz sentido.
 */
export function dropTarget(
  items: TreeItem[],
  draggedId: string,
  targetId: string,
  zone: DropZone,
): { parentId: string | null; index: number } | null {
  if (draggedId === targetId || isDescendant(items, draggedId, targetId)) return null;
  if (zone === "inside") return { parentId: targetId, index: Number.MAX_SAFE_INTEGER };
  const loc = locate(items, targetId);
  if (!loc) return null;
  const at = loc.siblings.filter((s) => s.id !== draggedId).findIndex((s) => s.id === targetId);
  return { parentId: loc.parentId, index: zone === "before" ? at : at + 1 };
}

export type Shift = "up" | "down" | "indent" | "outdent";

/**
 * Destino de "mover para cima / para baixo / para dentro da anterior / para fora", a alternativa
 * de teclado ao arrastar. O índice segue a regra do servidor: a página sai antes de ser inserida.
 */
export function shiftTarget(items: TreeItem[], id: string, shift: Shift): { parentId: string | null; index: number } | null {
  const loc = locate(items, id);
  if (!loc) return null;
  const i = loc.siblings.findIndex((s) => s.id === id);
  switch (shift) {
    case "up":
      return i > 0 ? { parentId: loc.parentId, index: i - 1 } : null;
    case "down":
      return i < loc.siblings.length - 1 ? { parentId: loc.parentId, index: i + 1 } : null;
    case "indent": {
      const previous = loc.siblings[i - 1];
      return previous ? { parentId: previous.id, index: Number.MAX_SAFE_INTEGER } : null;
    }
    case "outdent": {
      if (!loc.parentId) return null;
      const parentLoc = locate(items, loc.parentId);
      if (!parentLoc) return null;
      const parentIndex = parentLoc.siblings.findIndex((s) => s.id === loc.parentId);
      return { parentId: parentLoc.parentId, index: parentIndex + 1 };
    }
  }
}

/** Páginas acima de `id`, da raiz até o pai, para o caminho no topo da página. */
export function ancestorsOf(items: TreeItem[], id: string): TreeItem[] {
  for (const item of items) {
    if (item.id === id) return [];
    const inner = ancestorsOf(item.children, id);
    if (inner.length > 0 || findItem(item.children, id)) return [item, ...inner];
  }
  return [];
}

/** Todas as páginas em ordem de leitura, para listas de busca (ex.: link para outra página). */
export function flattenItems(items: TreeItem[]): TreeItem[] {
  return items.flatMap((i) => [i, ...flattenItems(i.children)]);
}

/**
 * Número de cada página (1, 2, 2.1), na ordem da árvore. Conta todas as páginas: é a numeração do
 * manual completo; o export pode pular as que ficam de fora.
 */
export function pageNumbers(items: TreeItem[], prefix = "", into = new Map<string, string>()): Map<string, string> {
  items.forEach((item, i) => {
    const number = prefix ? `${prefix}.${i + 1}` : String(i + 1);
    into.set(item.id, number);
    pageNumbers(item.children, number, into);
  });
  return into;
}

export interface PageMatch {
  item: TreeItem;
  /** Títulos das páginas acima, para diferenciar "Editar" de Clientes de "Editar" de Fornecedores. */
  path: string[];
}

/**
 * Páginas cujo título tem o texto buscado, sem ligar para acento e maiúscula. Quem começa com o
 * texto vem antes; depois, a ordem da árvore. Sem texto, devolve todas.
 */
export function searchPages(items: TreeItem[], query: string): PageMatch[] {
  const q = fold(query);
  const all: PageMatch[] = [];
  const walk = (nodes: TreeItem[], path: string[]) => {
    for (const item of nodes) {
      all.push({ item, path });
      walk(item.children, [...path, item.title || t("Sem título")]);
    }
  };
  walk(items, []);
  if (!q) return all;
  const hits = all.filter((m) => fold(m.item.title).includes(q));
  return [...hits.filter((m) => fold(m.item.title).startsWith(q)), ...hits.filter((m) => !fold(m.item.title).startsWith(q))];
}
