import { useState } from "react";
import type { TreeItem } from "@/lib/api";
import { dropTarget, type DropZone } from "@/lib/tree";
import { cn } from "@/lib/utils";
import { PageActions, type PageAction } from "./PageActions";

const DRAG_TYPE = "text/x-explicai-page";

interface Props {
  pages: TreeItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAction: (item: TreeItem, action: PageAction) => void;
  /** Mover `id` para a posição `index` dentro de `parentId` (null = raiz). */
  onMove: (id: string, parentId: string | null, index: number) => void;
}

/** Zona de soltura pela altura do cursor: terço de cima = antes, de baixo = depois, meio = dentro. */
function zoneAt(e: React.DragEvent<HTMLElement>): DropZone {
  const r = e.currentTarget.getBoundingClientRect();
  const y = (e.clientY - r.top) / r.height;
  return y < 0.3 ? "before" : y > 0.7 ? "after" : "inside";
}

export function PageTree({ pages, selectedId, onSelect, onAction, onMove }: Props) {
  const [hover, setHover] = useState<{ id: string; zone: DropZone } | null>(null);

  const drop = (targetId: string, zone: DropZone, draggedId: string) => {
    setHover(null);
    const to = dropTarget(pages, draggedId, targetId, zone);
    if (to) onMove(draggedId, to.parentId, to.index);
  };

  const renderLevel = (items: TreeItem[], depth: number) => (
    <ul className={cn(depth > 0 && "ml-3 border-l border-border pl-1")}>
      {items.map((item) => {
        const zone = hover?.id === item.id ? hover.zone : null;
        const selected = item.id === selectedId;
        return (
          <li key={item.id}>
            <div
              className={cn(
                "group relative flex items-center rounded-md pr-1 transition-colors hover:bg-muted",
                zone === "inside" && "outline-2 -outline-offset-2 outline-dashed outline-primary",
                zone === "before" && "before:absolute before:inset-x-2 before:-top-px before:h-0.5 before:bg-primary",
                zone === "after" && "after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:bg-primary",
              )}
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
              <button
                type="button"
                aria-current={selected ? "page" : undefined}
                onClick={() => onSelect(item.id)}
                className="min-w-0 flex-1 truncate py-1.5 pl-2 text-left text-[14.5px]"
              >
                {/* A página aberta ganha a faixa de marca-texto, como numa revisão no papel. */}
                <span
                  className={cn(
                    selected
                      ? "bg-[linear-gradient(transparent_50%,var(--marca-faixa)_50%)] font-bold text-foreground"
                      : "text-foreground/85",
                    !item.title && "italic text-muted-foreground",
                  )}
                >
                  {item.title || "Sem título"}
                </span>
              </button>
              <PageActions item={item} pages={pages} onAction={(action) => onAction(item, action)} />
            </div>
            {item.children.length > 0 && renderLevel(item.children, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  return renderLevel(pages, 0);
}
