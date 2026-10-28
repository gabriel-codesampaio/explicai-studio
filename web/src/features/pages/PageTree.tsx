import { useState } from "react";
import type { TreeItem } from "../../lib/api";
import { dropTarget, type DropZone } from "../../lib/tree";

const DRAG_TYPE = "text/x-explicai-page";

interface Props {
  pages: TreeItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onRemove: (item: TreeItem) => void;
  /** Mover `id` para a posição `index` dentro de `parentId` (null = raiz). */
  onMove: (id: string, parentId: string | null, index: number) => void;
}

/** Zona de soltura pela altura do cursor: terço de cima = antes, de baixo = depois, meio = dentro. */
function zoneAt(e: React.DragEvent<HTMLElement>): DropZone {
  const r = e.currentTarget.getBoundingClientRect();
  const y = (e.clientY - r.top) / r.height;
  return y < 0.3 ? "before" : y > 0.7 ? "after" : "inside";
}

export function PageTree(props: Props) {
  const [hover, setHover] = useState<{ id: string; zone: DropZone } | null>(null);

  const drop = (targetId: string, zone: DropZone, draggedId: string) => {
    setHover(null);
    const to = dropTarget(props.pages, draggedId, targetId, zone);
    if (to) props.onMove(draggedId, to.parentId, to.index);
  };

  const renderLevel = (items: TreeItem[], depth: number) => (
    <ul className="tree" role={depth === 0 ? "tree" : "group"}>
      {items.map((item) => {
        const zone = hover?.id === item.id ? hover.zone : null;
        const selected = item.id === props.selectedId;
        return (
          <li key={item.id} role="treeitem" aria-selected={selected}>
            <div
              className={`tree-row${selected ? " sel" : ""}${zone ? ` drop-${zone}` : ""}`}
              style={{ paddingLeft: 8 + depth * 16 }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(DRAG_TYPE, item.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
                e.preventDefault();
                setHover({ id: item.id, zone: zoneAt(e) });
              }}
              onDragLeave={() => setHover((h) => (h?.id === item.id ? null : h))}
              onDrop={(e) => {
                e.preventDefault();
                const draggedId = e.dataTransfer.getData(DRAG_TYPE);
                if (draggedId && zone) drop(item.id, zone, draggedId);
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
            {item.children.length > 0 && renderLevel(item.children, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  return renderLevel(props.pages, 0);
}
