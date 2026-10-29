import { ArrowDown, ArrowUp, IndentDecrease, IndentIncrease, MoreHorizontal, Move, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TreeItem } from "@/lib/api";
import { flattenItems, type Shift, shiftTarget } from "@/lib/tree";
import { cn } from "@/lib/utils";

export type PageAction = { kind: "addChild" } | { kind: "remove" } | { kind: "shift"; shift: Shift };

interface Props {
  item: TreeItem;
  pages: TreeItem[];
  /** Página aberta: as ações ficam à vista. */
  selected: boolean;
  onAction: (action: PageAction) => void;
}

/** As mesmas teclas valem na árvore (ver PageTree), por isso aparecem no menu. */
const SHIFTS: { shift: Shift; label: string; keys: string; Icon: typeof ArrowUp }[] = [
  { shift: "up", label: "Para cima", keys: "Alt+Shift+↑", Icon: ArrowUp },
  { shift: "down", label: "Para baixo", keys: "Alt+Shift+↓", Icon: ArrowDown },
  { shift: "indent", label: "Para dentro da anterior", keys: "Alt+Shift+→", Icon: IndentIncrease },
  { shift: "outdent", label: "Para fora", keys: "Alt+Shift+←", Icon: IndentDecrease },
];

const iconButton =
  "grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary";

/**
 * "+" para subpágina e o menu "⋯" da página. Aparecem ao passar o mouse, com o foco na linha
 * e na página aberta, para quem chega não precisar adivinhar que eles existem. Em telas de toque,
 * onde não existe "passar o mouse", ficam sempre à vista.
 */
export function PageActions({ item, pages, selected, onAction }: Props) {
  const name = item.title || "Sem título";
  const sub = flattenItems(item.children).length;

  return (
    <span
      className={cn(
        "flex opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 has-[[data-state=open]]:opacity-100 pointer-coarse:opacity-100",
        selected && "opacity-100",
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            tabIndex={-1}
            className={iconButton}
            aria-label={`Nova subpágina em ${name}`}
            onClick={() => onAction({ kind: "addChild" })}
          >
            <Plus className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Nova subpágina</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* data-row-menu: Shift+F10 na árvore abre este menu pelo teclado. */}
          <button type="button" tabIndex={-1} data-row-menu className={iconButton} aria-label={`Mais ações para ${name}`}>
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuItem onSelect={() => onAction({ kind: "addChild" })}>
            <Plus /> Nova subpágina
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Move className="size-4 text-muted-foreground" /> Mover
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-64">
              {SHIFTS.map(({ shift, label, keys, Icon }) => (
                <DropdownMenuItem
                  key={shift}
                  disabled={!shiftTarget(pages, item.id, shift)}
                  onSelect={() => onAction({ kind: "shift", shift })}
                >
                  <Icon /> {label}
                  <DropdownMenuShortcut>{keys}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => onAction({ kind: "remove" })}>
            <Trash2 /> {sub ? `Excluir página e ${sub} ${sub === 1 ? "subpágina" : "subpáginas"}` : "Excluir página"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}
