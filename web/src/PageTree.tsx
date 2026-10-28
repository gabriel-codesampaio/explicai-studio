import { useState } from "react";
import type { TreeItem } from "./api";

type Zone = "before" | "inside" | "after";

interface Props {
  pages: TreeItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onRemove: (item: TreeItem) => void;
  /** Mover `id` para a posição `index` dentro de `parentId` (null = raiz). */
  onMove: (id: string, parentId: string | null, index: number) => void;
}

export function PageTree(props: Props) {
  const [drag, setDrag] = useState<{ over: string; zone: Zone } | null>(null);

  const drop = (targetId: string, zone: Zone, draggedId: string) => {
    setDrag(null);
    if (draggedId === targetId || contains(props.pages, draggedId, targetId)) return;
    const loc = locate(props.pages, targetId);
    if (!loc) return;
    if (zone === "inside") return props.onMove(draggedId, targetId, Number.MAX_SAFE_INTEGER);
    // O índice é calculado sem a página arrastada, porque o servidor a remove antes de inserir.
    const siblings = loc.siblings.filter((s) => s.id !== draggedId);
    const at = siblings.findIndex((s) => s.id === targetId);
    props.onMove(draggedId, loc.parentId, zone === "before" ? at : at + 1);
  };

  const render = (items: TreeItem[], depth: number) => (
    <ul className="tree" role={depth === 0 ? "tree" : "group"}>
      {items.map((item) => {
        const zone = drag?.over === item.id ? drag.zone : null;
        return (
          <li key={item.id} role="treeitem" aria-selected={item.id === props.selectedId}>
            <div
              className={`tree-row${item.id === props.selectedId ? " sel" : ""}${zone ? ` drop-${zone}` : ""}`}
              style={{ paddingLeft: 8 + depth * 16 }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/x-explicai-page", item.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                if (!e.dataTransfer.types.includes("text/x-explicai-page")) return;
                e.preventDefault();
                const r = e.currentTarget.getBoundingClientRect();
                const y = (e.clientY - r.top) / r.height;
                setDrag({ over: item.id, zone: y < 0.3 ? "before" : y > 0.7 ? "after" : "inside" });
              }}
              onDragLeave={() => setDrag((d) => (d?.over === item.id ? null : d))}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/x-explicai-page");
                if (id && zone) drop(item.id, zone, id);
              }}
            >
              <button type="button" className="tree-title" onClick={() => props.onSelect(item.id)}>
                {item.title || "Sem título"}
              </button>
              <span className="tree-actions">
                <button type="button" className="icon" title="Nova subpágina" aria-label={`Nova subpágina em ${item.title}`} onClick={() => props.onAddChild(item.id)}>
                  +
                </button>
                <button type="button" className="icon" title="Excluir página" aria-label={`Excluir ${item.title}`} onClick={() => props.onRemove(item)}>
                  ×
                </button>
              </span>
            </div>
            {item.children.length > 0 && render(item.children, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  return render(props.pages, 0);
}

export function locate(items: TreeItem[], id: string, parentId: string | null = null): { parentId: string | null; siblings: TreeItem[] } | null {
  for (const item of items) {
    if (item.id === id) return { parentId, siblings: items };
    const inner = locate(item.children, id, item.id);
    if (inner) return inner;
  }
  return null;
}

export function findItem(items: TreeItem[], id: string): TreeItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    const inner = findItem(item.children, id);
    if (inner) return inner;
  }
  return null;
}

/** `targetId` está dentro da subárvore de `ancestorId`? */
function contains(items: TreeItem[], ancestorId: string, targetId: string): boolean {
  const ancestor = findItem(items, ancestorId);
  return ancestor ? findItem(ancestor.children, targetId) !== null : false;
}
