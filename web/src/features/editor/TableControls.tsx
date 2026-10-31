import type { Editor } from "@tiptap/react";
import { GripHorizontal, GripVertical, Plus } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { collisionPadding } from "./editorArea";
import { TableMenuItems } from "./TableMenuItems";
import { ADD_COLUMN_AFTER, ADD_ROW_AFTER, COLUMN_ACTIONS, ROW_ACTIONS, type TableAction } from "./tableCommands";
import { useTableTarget } from "./useTableTarget";

const SIZE = 24;
const BUTTON =
  "absolute z-[5] grid place-items-center rounded-[3px] border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground data-[state=open]:border-primary data-[state=open]:bg-primary data-[state=open]:text-primary-foreground";

/** Botão sem roubar o foco do editor, com dica e nome para o leitor de tela. */
function Control({ label, children, ...rest }: { label: string; children: ReactNode } & React.ComponentProps<"button">) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label={label} onMouseDown={(e) => e.preventDefault()} {...rest}>
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

interface Props {
  editor: Editor;
  /** Caixa `relative` que envolve o editor: as posições são medidas a partir dela. */
  host: RefObject<HTMLDivElement | null>;
}

/**
 * Controles na própria tabela, como no Confluence: "+" na borda direita e na de baixo, e uma alça por
 * linha e por coluna com o menu de inserir e remover. Aparecem com o mouse sobre a tabela ou com o cursor nela.
 */
export function TableControls({ editor, host }: Props) {
  const { target, pin } = useTableTarget(editor, host);
  const hostBox = host.current?.getBoundingClientRect();
  const table = target?.cell.closest("table");
  const viewport = table?.parentElement;
  if (!target || !hostBox || !table || !viewport) return null;

  const at = (el: Element) => {
    const r = el.getBoundingClientRect();
    return {
      left: r.left - hostBox.left,
      right: r.right - hostBox.left,
      top: r.top - hostBox.top,
      bottom: r.bottom - hostBox.top,
    };
  };
  const cell = at(target.cell);
  const box = at(table);
  const view = at(viewport);
  const clampX = (x: number) => Math.min(Math.max(x, view.left + SIZE / 2), view.right - SIZE / 2);
  const centerX = clampX((cell.left + cell.right) / 2);
  const centerY = (cell.top + cell.bottom) / 2;
  const half = SIZE / 2;

  const menu = (label: string, actions: TableAction[], style: React.CSSProperties, icon: ReactNode, className: string) => (
    <DropdownMenu onOpenChange={pin}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={label}
              onMouseDown={(e) => e.preventDefault()}
              style={style}
              className={cn(BUTTON, className)}
            >
              {icon}
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="start"
        collisionPadding={collisionPadding()}
        className="w-56"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <TableMenuItems editor={editor} actions={actions} cellPos={target.pos} />
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div data-table-controls>
      {menu(
        t("Opções da coluna"),
        COLUMN_ACTIONS,
        { left: centerX - 14, top: box.top - 12 },
        <GripHorizontal className="size-4" aria-hidden />,
        "h-5 w-7",
      )}
      {menu(
        t("Opções da linha"),
        ROW_ACTIONS,
        { left: view.left - half, top: centerY - 14 },
        <GripVertical className="size-4" aria-hidden />,
        "h-7 w-6",
      )}
      <Control
        label={t("Adicionar coluna à direita")}
        className={BUTTON}
        style={{ left: view.right - half, top: centerY - half, width: SIZE, height: SIZE }}
        onClick={() => ADD_COLUMN_AFTER.run(editor, target.pos)}
      >
        <Plus className="size-4" aria-hidden />
      </Control>
      <Control
        label={t("Adicionar linha abaixo")}
        className={BUTTON}
        style={{ left: centerX - half, top: box.bottom - half, width: SIZE, height: SIZE }}
        onClick={() => ADD_ROW_AFTER.run(editor, target.pos)}
      >
        <Plus className="size-4" aria-hidden />
      </Control>
    </div>
  );
}
