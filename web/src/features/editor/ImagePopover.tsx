import { NodeSelection } from "@tiptap/pm/state";
import { type Editor, useEditorState } from "@tiptap/react";
import { PenLine, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { assetPathFromSrc } from "@/lib/annotations";
import { t } from "@/lib/i18n";
import { ImageSizePicker } from "../annotations/ImageSizePicker";
import { AnchoredPopover } from "./AnchoredPopover";
import { collisionPadding, MARGEM } from "./editorArea";
import { ReplaceImage } from "./ReplaceImage";

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
/** Tamanho do balão com seletor de tamanho e botões (px). */
const BALAO_ALTURA = 300;
const BALAO_LARGURA = 320;

type Side = "top" | "right" | "bottom" | "left";

/** Primeiro lado da imagem com espaço para o balão inteiro: embaixo, direita, esquerda, em cima. Sem espaço, null. */
export function freeSide(
  r: DOMRect,
  vw: number,
  vh: number,
  pad: { top: number; right: number; bottom: number; left: number },
): Side | null {
  const w = BALAO_LARGURA + MARGEM;
  const h = BALAO_ALTURA + MARGEM;
  if (vh - pad.bottom - r.bottom >= h) return "bottom";
  if (vw - pad.right - r.right >= w) return "right";
  if (r.left - pad.left >= w) return "left";
  if (r.top - pad.top >= h) return "top";
  return null;
}

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
  // A imagem segue selecionada depois de fechar o balão: um novo clique nela não muda a seleção, então reabre à mão.
  useEffect(() => {
    if (dismissedAt === null) return;
    const dom = editor.view.dom;
    const reopen = (e: MouseEvent) => (e.target as HTMLElement).closest("img") && setDismissedAt(null);
    dom.addEventListener("click", reopen);
    return () => dom.removeEventListener("click", reopen);
  }, [dismissedAt, editor]);

  const imageRect = () => {
    const dom = image ? editor.view.nodeDOM(image.pos) : null;
    // O nó da imagem pode ocupar a coluna inteira; o balão se orienta pela figura em si.
    return dom instanceof HTMLElement ? (dom.querySelector("img") ?? dom).getBoundingClientRect() : null;
  };
  const side = (r: DOMRect | null) => (r && freeSide(r, window.innerWidth, window.innerHeight, collisionPadding())) || null;
  const rect = () => {
    const r = imageRect();
    if (!r) return new DOMRect();
    // Com espaço ao lado, o balão se apoia na imagem inteira e não a cobre. Sem espaço em lado nenhum
    // (imagem que ocupa a tela), ele se apoia na parte visível dela, com o seletor de tamanho incluso.
    if (side(r)) return r;
    const bottom = Math.max(
      r.top + 1,
      Math.min(r.bottom, window.innerHeight - collisionPadding().bottom - BALAO_ALTURA - MARGEM),
    );
    return new DOMRect(r.x, r.y, r.width, bottom - r.y);
  };

  return (
    <AnchoredPopover
      open={open}
      onClose={() => setDismissedAt(image?.pos ?? null)}
      getRect={rect}
      label={t("Descrição da imagem")}
      side={open ? (side(imageRect()) ?? "bottom") : "bottom"}
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
          <div className="mt-1 flex flex-wrap gap-2">
            {assetPathFromSrc(image.src) && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setDismissedAt(image.pos);
                  onAnnotate(image.src, image.alt);
                }}
              >
                <PenLine /> {t("Editar imagem")}
              </Button>
            )}
            {assetPathFromSrc(image.src) && (
              <ReplaceImage key={image.src} slug={slug} src={image.src} asset={assetPathFromSrc(image.src) ?? ""} />
            )}
            {/* Mesma ação do Delete com a imagem selecionada; Ctrl+Z restaura. A tecla vai no title: com ela o rótulo quebrava a linha. */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              title="Del"
              aria-keyshortcuts="Delete"
              onClick={() => editor.chain().focus().deleteSelection().run()}
            >
              <Trash2 /> {t("Remover imagem")}
            </Button>
          </div>
        </div>
      )}
    </AnchoredPopover>
  );
}
