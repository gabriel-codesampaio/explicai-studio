import { TextSelection } from "@tiptap/pm/state";
import { type Editor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Code, Italic, Link2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { BlockTypeMenu } from "./BlockTypeMenu";
import { ToolbarButton as Btn } from "./ToolbarButton";
import { TEXT_COLORS, type TextColorName } from "./textColor";

interface Props {
  editor: Editor;
  pickImage: () => void;
  onEditLink: () => void;
}

const COLOR_LABELS: Record<TextColorName, string> = {
  gray: "Cinza",
  red: "Vermelho",
  orange: "Laranja",
  green: "Verde",
  blue: "Azul",
  purple: "Roxo",
};

const MENU_KEY = "selectionMenu";

const Divider = () => <span className="mx-1 h-5 w-px bg-border" aria-hidden />;

/**
 * Barra que aparece sobre o texto selecionado, como no Confluence: tipo do bloco, formatação e cor.
 * Atalho para o mouse; pelo teclado, a barra fixa de cima faz o mesmo (menos a cor).
 */
export function SelectionMenu({ editor, pickImage, onEditLink }: Props) {
  const [colorsOpen, setColorsOpen] = useState(false);
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      code: e.isActive("code"),
      link: e.isActive("link"),
      color: (e.getAttributes("textColor").color as TextColorName | undefined) ?? null,
    }),
  });
  const chain = () => editor.chain().focus();
  // A linha de cores muda a altura da barra: reposiciona para não cobrir o texto selecionado.
  useEffect(() => {
    if (colorsOpen) editor.view.dispatch(editor.state.tr.setMeta(MENU_KEY, "updatePosition"));
  }, [colorsOpen, editor]);
  const paint = (color: TextColorName | null) => {
    (color ? chain().setTextColor(color) : chain().unsetTextColor()).run();
    setColorsOpen(false);
  };

  return (
    <BubbleMenu
      editor={editor}
      pluginKey={MENU_KEY}
      options={{ placement: "top-start", offset: 8, onHide: () => setColorsOpen(false) }}
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
        <button
          type="button"
          aria-label={t("Cor do texto")}
          aria-expanded={colorsOpen}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setColorsOpen((o) => !o)}
          className="inline-flex h-8 flex-col items-center justify-center rounded-md px-2 font-display text-sm font-bold hover:bg-secondary"
        >
          <span aria-hidden>A</span>
          <span
            aria-hidden
            className="-mt-0.5 h-[3px] w-4 rounded-full bg-foreground"
            style={s.color ? { background: `var(--cor-${s.color})` } : undefined}
          />
        </button>
      </div>
      {colorsOpen && (
        <fieldset
          aria-label={t("Cor do texto")}
          className="mt-1 flex items-center gap-1 border-t border-border px-1 pt-1.5 pb-0.5"
        >
          <button
            type="button"
            aria-label={t("Cor padrão")}
            aria-pressed={!s.color}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => paint(null)}
            className={cn(
              "grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-secondary",
              !s.color && "ring-2 ring-ring",
            )}
          >
            <X className="size-3.5" aria-hidden />
          </button>
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              title={t(COLOR_LABELS[color])}
              aria-label={t(COLOR_LABELS[color])}
              aria-pressed={s.color === color}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => paint(color)}
              className={cn(
                "grid size-7 place-items-center rounded-md border border-border font-display text-sm font-bold hover:bg-secondary",
                s.color === color && "ring-2 ring-ring",
              )}
              style={{ color: `var(--cor-${color})` }}
            >
              A
            </button>
          ))}
        </fieldset>
      )}
    </BubbleMenu>
  );
}
