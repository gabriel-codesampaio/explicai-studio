import { TextSelection } from "@tiptap/pm/state";
import { type Editor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Code, Italic, Link2 } from "lucide-react";
import { t } from "@/lib/i18n";
import { BlockTypeMenu } from "./BlockTypeMenu";
import { TextColorMenu } from "./TextColorMenu";
import { ToolbarButton as Btn } from "./ToolbarButton";

interface Props {
  editor: Editor;
  pickImage: () => void;
  onEditLink: () => void;
}

const MENU_KEY = "selectionMenu";

const Divider = () => <span className="mx-1 h-5 w-px bg-border" aria-hidden />;

/**
 * Barra que aparece sobre o texto selecionado, como no Confluence: tipo do bloco, formatação e cor.
 * Atalho para o mouse; pelo teclado, a barra fixa de cima faz o mesmo.
 */
export function SelectionMenu({ editor, pickImage, onEditLink }: Props) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      code: e.isActive("code"),
      link: e.isActive("link"),
    }),
  });
  const chain = () => editor.chain().focus();
  return (
    <BubbleMenu
      editor={editor}
      pluginKey={MENU_KEY}
      options={{ placement: "top-start", offset: 8 }}
      // Só em texto selecionado: o print selecionado tem o seu próprio menu (ImagePopover), e no bloco de código não há cor.
      shouldShow={({ view, state, from, to }) =>
        view.hasFocus() &&
        state.selection instanceof TextSelection &&
        state.doc.textBetween(from, to).trim().length > 0 &&
        !editor.isActive("codeBlock")
      }
      className="z-20 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
    >
      <div role="toolbar" aria-label={t("Formatar seleção")} className="flex items-center gap-0.5">
        <BlockTypeMenu editor={editor} pickImage={pickImage} className="w-auto" />
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
        <Divider />
        <TextColorMenu editor={editor} />
      </div>
    </BubbleMenu>
  );
}
