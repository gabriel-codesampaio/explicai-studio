import { NodeSelection } from "@tiptap/pm/state";
import { type Editor, useEditorState } from "@tiptap/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AnchoredPopover } from "./AnchoredPopover";

/** Imagem selecionada (clique nela): posição no documento e descrição atual. */
function selectedImage(editor: Editor): { pos: number; alt: string } | null {
  const sel = editor.state.selection;
  if (!(sel instanceof NodeSelection) || sel.node.type.name !== "image") return null;
  return { pos: sel.from, alt: (sel.node.attrs.alt as string | null) ?? "" };
}

/**
 * Ao clicar numa imagem, um balão pede a descrição dela. A descrição vira o texto alternativo no
 * Markdown, lido por leitores de tela e pela IA que usa o manual.
 */
export function ImagePopover({ editor }: { editor: Editor }) {
  const image = useEditorState({ editor, selector: ({ editor: e }) => selectedImage(e) });
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);
  const open = image !== null && dismissedAt !== image.pos;
  if (image === null && dismissedAt !== null) setDismissedAt(null);

  const rect = () => {
    const dom = image ? editor.view.nodeDOM(image.pos) : null;
    return dom instanceof HTMLElement ? dom.getBoundingClientRect() : new DOMRect();
  };

  return (
    <AnchoredPopover open={open} onClose={() => setDismissedAt(image?.pos ?? null)} getRect={rect} label="Descrição da imagem">
      {image && (
        <div className="grid gap-2">
          <label htmlFor="image-alt" className="text-sm font-bold">
            Descrição da imagem
          </label>
          <Input
            id="image-alt"
            defaultValue={image.alt}
            key={image.pos}
            placeholder="Ex.: Tela de clientes com o botão Novo cliente"
            onChange={(e) => editor.chain().updateAttributes("image", { alt: e.target.value }).setNodeSelection(image.pos).run()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setDismissedAt(image.pos);
                editor.commands.focus();
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Quem usa leitor de tela e a IA que lê o manual entendem a imagem por aqui.
          </p>
        </div>
      )}
    </AnchoredPopover>
  );
}
