import { TriangleAlert } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TreeItem } from "@/lib/api";
import { t } from "@/lib/i18n";
import { type DropZone, dropTarget, findItem, numberPages } from "@/lib/tree";
import { cn } from "@/lib/utils";
import { type PageAction, PageActions } from "./PageActions";
import { StatusMark } from "./StatusMenu";
import { useTreeKeyboard } from "./useTreeKeyboard";

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

interface RowProps {
  item: TreeItem;
  num: string | undefined;
  selected: boolean;
  tabStop: boolean;
  zone: DropZone | null;
  menuOpen: boolean;
  getPages: () => TreeItem[];
  onSelect: (id: string) => void;
  onAction: (item: TreeItem, action: PageAction) => void;
  onMenuFor: (id: string | null) => void;
  onHover: React.Dispatch<React.SetStateAction<{ id: string; zone: DropZone } | null>>;
  onDrop: (targetId: string, zone: DropZone, draggedId: string) => void;
}

/** Linha da árvore, memoizada: só re-renderiza quando algo dela muda (T-422). Todos os callbacks vêm estáveis. */
const TreeRow = memo(function TreeRow({
  item,
  num,
  selected,
  tabStop,
  zone,
  menuOpen,
  getPages,
  onSelect,
  onAction,
  onMenuFor,
  onHover,
  onDrop,
}: RowProps) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: arrastar é atalho de mouse; pelo teclado, o menu "⋯" move a página
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
        onHover({ id: item.id, zone: zoneAt(e) });
      }}
      onDragLeave={() => onHover((h) => (h?.id === item.id ? null : h))}
      onDrop={(e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData(DRAG_TYPE);
        if (draggedId && zone) onDrop(item.id, zone, draggedId);
      }}
    >
      <button
        type="button"
        data-page-id={item.id}
        data-page-title={item.title}
        tabIndex={tabStop ? 0 : -1}
        aria-current={selected ? "page" : undefined}
        onClick={() => onSelect(item.id)}
        className="flex min-w-0 flex-1 items-center py-1.5 pl-2 text-left text-[14.5px]"
      >
        {num && (
          <span aria-hidden className="mr-1.5 inline-block shrink-0 font-mono text-xs tabular-nums text-primary">
            {num}
          </span>
        )}
        {/* A página aberta ganha a faixa de marca-texto, como numa revisão no papel. */}
        <span
          title={item.title || (item.problem ? item.file.split("/").pop() : t("Sem título"))}
          className={cn(
            "min-w-0 truncate",
            selected
              ? "bg-[linear-gradient(transparent_50%,var(--marca-faixa)_50%)] font-bold text-foreground"
              : "text-foreground/85",
            !item.title && "italic text-muted-foreground",
          )}
        >
          {item.title || (item.problem ? item.file.split("/").pop() : t("Sem título"))}
        </span>
        {item.status !== "rascunho" && <StatusMark status={item.status} className="ml-2" />}
        {item.problem && (
          <span title={item.problem} className="ml-1.5 inline-flex align-[-2px] text-destructive">
            <TriangleAlert className="size-3.5" aria-hidden />
            <span className="sr-only">{item.problem}</span>
          </span>
        )}
      </button>
      <PageActions
        item={item}
        getPages={getPages}
        selected={selected}
        menuOpen={menuOpen}
        onMenuOpenChange={(open) => onMenuFor(open ? item.id : null)}
        onAction={(action) => onAction(item, action)}
      />
    </div>
  );
});

export function PageTree({ pages, selectedId, onSelect, onAction, onMove }: Props) {
  const [hover, setHover] = useState<{ id: string; zone: DropZone } | null>(null);
  // Menu "⋯" aberto pelo teclado (Shift+F10) ou pelo clique; um por vez.
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const { onKeyDown, root } = useTreeKeyboard(
    pages,
    (id, shift) => {
      const item = findItem(pages, id);
      if (item) onAction(item, { kind: "shift", shift });
    },
    setMenuFor,
  );
  // Uma parada só do Tab: a página aberta (ou a primeira) recebe o foco ao entrar na árvore.
  const tabStop = selectedId && findItem(pages, selectedId) ? selectedId : pages[0]?.id;

  // A numeração só muda com a árvore; hover de arrastar e menu aberto re-renderizam sem mudar `pages`.
  const numbers = useMemo(() => numberPages(pages), [pages]);

  // Callbacks estáveis (leem o último valor por ref) para as linhas memoizadas não re-renderizarem à toa.
  const latest = useRef({ pages, onSelect, onAction, onMove });
  useEffect(() => {
    latest.current = { pages, onSelect, onAction, onMove };
  });
  const getPages = useCallback(() => latest.current.pages, []);
  const select = useCallback((id: string) => latest.current.onSelect(id), []);
  const act = useCallback((item: TreeItem, action: PageAction) => latest.current.onAction(item, action), []);
  const drop = useCallback((targetId: string, zone: DropZone, draggedId: string) => {
    const { pages, onMove } = latest.current;
    setHover(null);
    const to = dropTarget(pages, draggedId, targetId, zone);
    if (to) onMove(draggedId, to.parentId, to.index);
  }, []);

  const renderLevel = (items: TreeItem[], depth: number) => (
    // O teclado chega dos botões das páginas e sobe até a lista (ver useTreeKeyboard).
    <ul
      ref={depth === 0 ? root : undefined}
      className={cn(depth > 0 && "ml-3 border-l border-border pl-1")}
      onKeyDown={depth === 0 ? onKeyDown : undefined}
    >
      {items.map((item) => {
        const zone = hover?.id === item.id ? hover.zone : null;
        const selected = item.id === selectedId;
        return (
          <li key={item.id}>
            <TreeRow
              item={item}
              num={numbers.get(item.id)}
              selected={selected}
              tabStop={item.id === tabStop}
              zone={zone}
              menuOpen={menuFor === item.id}
              getPages={getPages}
              onSelect={select}
              onAction={act}
              onMenuFor={setMenuFor}
              onHover={setHover}
              onDrop={drop}
            />
            {item.children.length > 0 && renderLevel(item.children, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  return renderLevel(pages, 0);
}
