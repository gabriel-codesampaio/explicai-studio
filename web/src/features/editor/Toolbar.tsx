import { type Editor, useEditorState } from "@tiptap/react";
import { Bold, Code, ImageIcon, Italic, Link2, Table, TableColumnsSplit, TableRowsSplit, Trash2 } from "lucide-react";
import { useRef } from "react";
import { useRovingFocus } from "@/hooks/useRovingFocus";
import { useScrollEdges } from "@/hooks/useScrollEdges";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { BlockTypeMenu } from "./BlockTypeMenu";
import { TextColorMenu } from "./TextColorMenu";
import { ToolbarButton as Btn } from "./ToolbarButton";

interface Props {
  editor: Editor;
  onPickImage: () => void;
  onEditLink: () => void;
}

/** Degradê na borda da barra que tem mais botões escondidos; some com a rolagem. */
const Fade = ({ show, side }: { show: boolean; side: "left" | "right" }) => (
  <span
    aria-hidden
    className={cn(
      "pointer-events-none absolute inset-y-0 w-8 transition-opacity motion-reduce:transition-none",
      side === "left" ? "left-0 bg-gradient-to-r" : "right-0 bg-gradient-to-l",
      "from-background to-transparent",
      show ? "opacity-100" : "opacity-0",
    )}
  />
);

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
  const scroller = useRef<HTMLDivElement>(null);
  const edges = useScrollEdges(scroller);

  return (
    <div className="sticky top-0 z-10 -mx-2 border-b border-border bg-background/95 backdrop-blur-sm">
      <div
        ref={scroller}
        role="toolbar"
        aria-label={t("Formatação")}
        onKeyDown={onKeyDown}
        className="flex items-center gap-0.5 overflow-x-auto px-2 py-2 [scrollbar-width:none]"
      >
        <BlockTypeMenu editor={editor} pickImage={onPickImage} />
        <Btn icon={ImageIcon} label={t("Imagem")} hint={t("Colar print")} shortcut="Ctrl+V" showLabel onClick={onPickImage} />
        <Divider />
        <Btn icon={Bold} label={t("Negrito")} shortcut="Ctrl+B" active={s.bold} onClick={() => chain().toggleBold().run()} />
        <Btn
          icon={Italic}
          label={t("Itálico")}
          shortcut="Ctrl+I"
          active={s.italic}
          onClick={() => chain().toggleItalic().run()}
        />
        <Btn
          icon={Code}
          label={t("Código no texto")}
          shortcut="Ctrl+E"
          active={s.code}
          onClick={() => chain().toggleCode().run()}
        />
        <Btn icon={Link2} label={t("Link")} shortcut="Ctrl+K" active={s.link} onClick={onEditLink} />
        <TextColorMenu editor={editor} roving />
        <Divider />
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
      </div>
      <Fade show={edges.start} side="left" />
      <Fade show={edges.end} side="right" />
    </div>
  );
}
