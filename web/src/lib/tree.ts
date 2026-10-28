import type { TreeItem } from "./api";

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
