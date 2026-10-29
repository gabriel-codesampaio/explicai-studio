import { ArrowDown, ArrowUp, IndentDecrease, IndentIncrease, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TreeItem } from "@/lib/api";
import { type Shift, shiftTarget } from "@/lib/tree";

export type PageAction = { kind: "addChild" } | { kind: "remove" } | { kind: "shift"; shift: Shift };

interface Props {
  item: TreeItem;
  pages: TreeItem[];
  onAction: (action: PageAction) => void;
}

const SHIFTS: { shift: Shift; label: string; Icon: typeof ArrowUp }[] = [
  { shift: "up", label: "Mover para cima", Icon: ArrowUp },
  { shift: "down", label: "Mover para baixo", Icon: ArrowDown },
  { shift: "indent", label: "Mover para dentro da anterior", Icon: IndentIncrease },
  { shift: "outdent", label: "Mover para fora", Icon: IndentDecrease },
];

const iconButton =
  "grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary";

/** "+" para subpágina e o menu "⋯" da página. Aparecem ao passar o mouse ou com o foco na linha. */
export function PageActions({ item, pages, onAction }: Props) {
  const name = item.title || "Sem título";
  return (
    <span className="flex opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 has-[[data-state=open]]:opacity-100">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
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
          <button type="button" className={iconButton} aria-label={`Mais ações para ${name}`}>
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuItem onSelect={() => onAction({ kind: "addChild" })}>
            <Plus /> Nova subpágina
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {SHIFTS.map(({ shift, label, Icon }) => (
            <DropdownMenuItem
              key={shift}
              disabled={!shiftTarget(pages, item.id, shift)}
              onSelect={() => onAction({ kind: "shift", shift })}
            >
              <Icon /> {label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => onAction({ kind: "remove" })}>
            <Trash2 /> Excluir página
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}
