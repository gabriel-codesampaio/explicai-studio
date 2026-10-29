import { NodeSelection } from "@tiptap/pm/state";
import { type Editor, useEditorState } from "@tiptap/react";
import { PenLine } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { assetPathFromSrc } from "@/lib/annotations";
import { AnchoredPopover } from "./AnchoredPopover";

/** Imagem selecionada (clique nela): posição no documento e descrição atual. */
function selectedImage(editor: Editor): { pos: number; alt: string; src: string } | null {
  const sel = editor.state.selection;
  if (!(sel instanceof NodeSelection) || sel.node.type.name !== "image") return null;
  return { pos: sel.from, alt: (sel.node.attrs.alt as string | null) ?? "", src: sel.node.attrs.src as string };
}

/**
 * Ao clicar numa imagem, um balão pede a descrição dela. A descrição vira o texto alternativo no
 * Markdown, lido por leitores de tela e pela IA que usa o manual.
 */
export function ImagePopover({ editor, onAnnotate }: { editor: Editor; onAnnotate: (src: string, alt: string) => void }) {
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
          {assetPathFromSrc(image.src) && (
            <Button
              type="button"
              size="sm"
              className="mt-1 justify-self-start"
              onClick={() => {
                setDismissedAt(image.pos);
                onAnnotate(image.src, image.alt);
              }}
            >
              <PenLine /> Marcar imagem
            </Button>
          )}
        </div>
      )}
    </AnchoredPopover>
  );
}
