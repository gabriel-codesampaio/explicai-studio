import { NodeSelection } from "@tiptap/pm/state";
import { type Editor, useEditorState } from "@tiptap/react";
import { PenLine } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { assetPathFromSrc } from "@/lib/annotations";
import { t } from "@/lib/i18n";
import { ImageSizePicker } from "../annotations/ImageSizePicker";
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
/** Altura do balão com seletor de tamanho e botão (px), mais a folga do rodapé. */
const BALAO_ALTURA = 330;

export function ImagePopover({
  editor,
  slug,
  onAnnotate,
}: {
  editor: Editor;
  slug: string;
  onAnnotate: (src: string, alt: string) => void;
}) {
  const image = useEditorState({ editor, selector: ({ editor: e }) => selectedImage(e) });
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);
  const open = image !== null && dismissedAt !== image.pos;
  if (image === null && dismissedAt !== null) setDismissedAt(null);

  const rect = () => {
    const dom = image ? editor.view.nodeDOM(image.pos) : null;
    if (!(dom instanceof HTMLElement)) return new DOMRect();
    const r = dom.getBoundingClientRect();
    // Imagem grande não deixa espaço embaixo: o balão (seletor de tamanho incluso) se apoia na parte visível dela.
    const bottom = Math.max(r.top + 1, Math.min(r.bottom, window.innerHeight - BALAO_ALTURA));
    return new DOMRect(r.x, r.y, r.width, bottom - r.y);
  };

  return (
    <AnchoredPopover
      open={open}
      onClose={() => setDismissedAt(image?.pos ?? null)}
      getRect={rect}
      label={t("Descrição da imagem")}
      onEscape={() => editor.commands.focus()}
    >
      {image && (
        <div className="grid gap-2">
          <label htmlFor="image-alt" className="text-sm font-bold">
            {t("Descrição da imagem")}
          </label>
          <Input
            id="image-alt"
            defaultValue={image.alt}
            key={image.pos}
            placeholder={t("Ex.: Tela de clientes com o botão Novo cliente")}
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
            {t("Quem usa leitor de tela e a IA que lê o manual entendem a imagem por aqui.")}
          </p>
          {assetPathFromSrc(image.src) && <ImageSizePicker slug={slug} src={image.src} />}
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
              <PenLine /> {t("Editar imagem")}
            </Button>
          )}
        </div>
      )}
    </AnchoredPopover>
  );
}
