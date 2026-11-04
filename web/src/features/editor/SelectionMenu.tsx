import { TextSelection } from "@tiptap/pm/state";
import { type Editor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Code, Highlighter, Italic, Link2 } from "lucide-react";
import { t } from "@/lib/i18n";
import { BlockTypeMenu } from "./BlockTypeMenu";
import { FontMenu } from "./FontMenu";
import { TextColorMenu } from "./TextColorMenu";
import { ToolbarButton as Btn } from "./ToolbarButton";

interface Props {
  editor: Editor;
  pickImage: () => void;
  onEditLink: () => void;
}

const MENU_KEY = "selectionMenu";

/**
 * Vira a barra para baixo da seleção quando, em cima, ela cobriria a barra fixa (e as dicas dos botões dela).
 * Só o viewport conta como limite (boundary vazio); o topo útil começa onde a barra fixa termina.
 */
const FLIP_BELOW_TOOLBAR = () => ({
  boundary: [],
  padding: { top: document.querySelector("[data-editor-toolbar]")?.getBoundingClientRect().bottom ?? 0 },
});

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
      highlight: e.isActive("highlight"),
    }),
  });
  const chain = () => editor.chain().focus();
  return (
    <BubbleMenu
      editor={editor}
      pluginKey={MENU_KEY}
      options={{ placement: "top-start", offset: 8, flip: FLIP_BELOW_TOOLBAR }}
      // Só em texto selecionado: o print selecionado tem o seu próprio menu (ImagePopover), e no bloco de código não há cor.
      shouldShow={({ view, state, from, to }) =>
        view.hasFocus() &&
        state.selection instanceof TextSelection &&
        state.doc.textBetween(from, to).trim().length > 0 &&
        !editor.isActive("codeBlock")
      }
      className="z-20 rounded-md bg-popover p-0.5 text-popover-foreground shadow-sm ring-1 ring-border/60"
    >
      <div role="toolbar" aria-label={t("Formatar seleção")} className="flex items-center gap-0.5">
        <BlockTypeMenu editor={editor} pickImage={pickImage} className="w-auto" floating />
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
        <Btn
          icon={Highlighter}
          label={t("Marca-texto")}
          shortcut="Ctrl+Shift+H"
          active={s.highlight}
          onClick={() => chain().toggleHighlight().run()}
        />
        <Divider />
        <TextColorMenu editor={editor} />
        <FontMenu editor={editor} />
      </div>
    </BubbleMenu>
  );
}
