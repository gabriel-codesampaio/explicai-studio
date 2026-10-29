import { type Editor, useEditorState } from "@tiptap/react";
import { Bold, Code, ImageIcon, Italic, Link2, Table, TableColumnsSplit, TableRowsSplit, Trash2 } from "lucide-react";
import { useRovingFocus } from "@/hooks/useRovingFocus";
import { t } from "@/lib/i18n";
import { BlockTypeMenu } from "./BlockTypeMenu";
import { ToolbarButton as Btn } from "./ToolbarButton";

interface Props {
  editor: Editor;
  onPickImage: () => void;
  onEditLink: () => void;
}

const Divider = () => <span className="mx-1 h-5 w-px bg-border" aria-hidden />;

export function Toolbar({ editor, onPickImage, onEditLink }: Props) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      code: e.isActive("code"),
      link: e.isActive("link"),
      inTable: e.isActive("table"),
    }),
  });
  const chain = () => editor.chain().focus();
  const onKeyDown = useRovingFocus();

  return (
    <div
      role="toolbar"
      aria-label={t("Formatação")}
      onKeyDown={onKeyDown}
      className="sticky top-0 z-10 -mx-2 flex items-center gap-0.5 overflow-x-auto border-b border-border bg-background/95 px-2 py-2 backdrop-blur-sm [scrollbar-width:none]"
    >
      <BlockTypeMenu editor={editor} pickImage={onPickImage} />
      <Divider />
      <Btn icon={Bold} label={t("Negrito")} shortcut="Ctrl+B" active={s.bold} onClick={() => chain().toggleBold().run()} />
      <Btn icon={Italic} label={t("Itálico")} shortcut="Ctrl+I" active={s.italic} onClick={() => chain().toggleItalic().run()} />
      <Btn
        icon={Code}
        label={t("Código no texto")}
        shortcut="Ctrl+E"
        active={s.code}
        onClick={() => chain().toggleCode().run()}
      />
      <Btn icon={Link2} label={t("Link")} shortcut="Ctrl+K" active={s.link} onClick={onEditLink} />
      <Divider />
      <Btn icon={ImageIcon} label={t("Imagem")} showLabel onClick={onPickImage} />
      {s.inTable ? (
        <>
          <Btn icon={TableRowsSplit} label={t("Adicionar linha")} onClick={() => chain().addRowAfter().run()} />
          <Btn icon={TableColumnsSplit} label={t("Adicionar coluna")} onClick={() => chain().addColumnAfter().run()} />
          <Btn icon={Trash2} label={t("Remover tabela")} onClick={() => chain().deleteTable().run()} />
        </>
      ) : (
        <Btn
          icon={Table}
          label={t("Tabela")}
          onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        />
      )}
      <span className="ml-auto hidden shrink-0 pl-3 text-xs whitespace-nowrap text-muted-foreground lg:block">
        {t("Digite")} <kbd className="rounded border border-border bg-card px-1 font-mono">/</kbd> {t("para inserir blocos")}
      </span>
    </div>
  );
}
