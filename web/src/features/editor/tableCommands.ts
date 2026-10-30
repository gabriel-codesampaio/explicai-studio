import type { Editor } from "@tiptap/react";
import { t } from "../../lib/i18n";

export interface TableAction {
  id: string;
  label: () => string;
  /** Com `cellPos`, a ação vale para aquela célula (alça do mouse); sem ele, para onde está o cursor. */
  run: (editor: Editor, cellPos?: number) => boolean;
  danger?: boolean;
}

/** Põe o cursor dentro da célula (início do primeiro parágrafo) antes do comando do TableKit. */
const onCell = (editor: Editor, cellPos?: number) => {
  const chain = editor.chain().focus();
  return cellPos === undefined ? chain : chain.setTextSelection(cellPos + 2);
};

export const ADD_ROW_AFTER: TableAction = {
  id: "row-after",
  label: () => t("Inserir linha abaixo"),
  run: (e, p) => onCell(e, p).addRowAfter().run(),
};
export const ADD_COLUMN_AFTER: TableAction = {
  id: "col-after",
  label: () => t("Inserir coluna à direita"),
  run: (e, p) => onCell(e, p).addColumnAfter().run(),
};

export const ROW_ACTIONS: TableAction[] = [
  { id: "row-before", label: () => t("Inserir linha acima"), run: (e, p) => onCell(e, p).addRowBefore().run() },
  ADD_ROW_AFTER,
  { id: "row-header", label: () => t("Linha de cabeçalho"), run: (e, p) => onCell(e, p).toggleHeaderRow().run() },
  { id: "row-delete", label: () => t("Remover linha"), run: (e, p) => onCell(e, p).deleteRow().run(), danger: true },
];

export const COLUMN_ACTIONS: TableAction[] = [
  { id: "col-before", label: () => t("Inserir coluna à esquerda"), run: (e, p) => onCell(e, p).addColumnBefore().run() },
  ADD_COLUMN_AFTER,
  { id: "col-delete", label: () => t("Remover coluna"), run: (e, p) => onCell(e, p).deleteColumn().run(), danger: true },
];

export const DELETE_TABLE: TableAction = {
  id: "table-delete",
  label: () => t("Remover tabela"),
  run: (e, p) => onCell(e, p).deleteTable().run(),
  danger: true,
};
