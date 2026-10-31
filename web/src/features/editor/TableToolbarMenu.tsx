import type { Editor } from "@tiptap/react";
import { Settings2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { t } from "@/lib/i18n";
import { TableMenuItems } from "./TableMenuItems";
import { COLUMN_ACTIONS, ROW_ACTIONS } from "./tableCommands";

const ALL = [...ROW_ACTIONS, ...COLUMN_ACTIONS];

/** Menu da barra fixa com todas as ações da tabela: o caminho pelo teclado para o que as alças fazem com o mouse. */
export function TableToolbarMenu({ editor }: { editor: Editor }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-roving
          tabIndex={-1}
          aria-label={t("Opções da tabela")}
          onMouseDown={(e) => e.preventDefault()}
          className="inline-flex h-8 items-center rounded-md px-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:min-w-11 [@media(pointer:coarse)]:justify-center"
        >
          <Settings2 className="size-4" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56" onCloseAutoFocus={(e) => e.preventDefault()}>
        <TableMenuItems editor={editor} actions={ALL} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
