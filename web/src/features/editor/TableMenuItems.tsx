import type { Editor } from "@tiptap/react";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import type { TableAction } from "./tableCommands";
import { DELETE_TABLE } from "./tableCommands";

/** Itens do menu de uma alça (ou da barra): as ações do grupo e, no fim, "Remover tabela". */
export function TableMenuItems({ editor, actions, cellPos }: { editor: Editor; actions: TableAction[]; cellPos?: number }) {
  const item = (a: TableAction) => (
    <DropdownMenuItem key={a.id} variant={a.danger ? "destructive" : "default"} onSelect={() => a.run(editor, cellPos)}>
      {a.label()}
    </DropdownMenuItem>
  );
  return (
    <>
      {actions.filter((a) => !a.danger).map(item)}
      <DropdownMenuSeparator />
      {actions.filter((a) => a.danger).map(item)}
      {item(DELETE_TABLE)}
    </>
  );
}
