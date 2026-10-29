import { Extension } from "@tiptap/core";
import FileHandler from "@tiptap/extension-file-handler";
import { EditorContent, type Editor as TiptapEditor, useEditor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { AnnotationEditor } from "@/features/annotations/AnnotationEditor";
import { AnnotatedImage } from "@/features/annotations/annotatedImage";
import { assetPathFromSrc } from "@/lib/annotations";
import type { TreeItem } from "@/lib/api";
import { toDiskMarkdown, toEditorMarkdown } from "@/lib/imagePaths";
import { syncSelectionFromDom } from "./domSelection";
import { contentExtensions } from "./extensions";
import { ImagePopover } from "./ImagePopover";
import { IMAGE_TYPES, insertImages } from "./imageUpload";
import { LinkPopover } from "./LinkPopover";
import { SlashCommand } from "./slash/slashCommand";
import { Toolbar } from "./Toolbar";

interface Props {
  slug: string;
  /** Markdown como está no disco. O editor é recriado por página (key no componente pai). */
  initialMarkdown: string;
  onChange: (markdown: string) => void;
  onError: (message: string) => void;
  /** Páginas do manual, para o link entre páginas. */
  pages: TreeItem[];
  /** Entrega a instância do editor ao pai (ex.: Enter no título leva o cursor para o texto). */
  onReady?: (editor: TiptapEditor) => void;
}

export function Editor({ slug, initialMarkdown, onChange, onError, onReady, pages }: Props) {
  // Os callbacks mudam a cada render; as extensões são criadas uma vez e leem sempre a versão atual.
  const latest = useRef({ slug, onChange, onError });
  latest.current = { slug, onChange, onError };
  const fileInput = useRef<HTMLInputElement>(null);
  const pickImage = () => fileInput.current?.click();
  const [linkOpen, setLinkOpen] = useState(false);
  const [annotating, setAnnotating] = useState<{ src: string; alt: string } | null>(null);
  const upload = (ed: TiptapEditor, files: File[], pos: number) =>
    void insertImages(ed, latest.current.slug, files, pos, latest.current.onError);

  const editor = useEditor({
    extensions: [
      ...contentExtensions(AnnotatedImage.configure({ slug })),
      SlashCommand.configure({ pickImage }),
      Extension.create({
        name: "linkShortcut",
        addKeyboardShortcuts: () => ({
          "Mod-k": ({ editor: ed }) => {
            syncSelectionFromDom(ed);
            setLinkOpen(true);
            return true;
          },
        }),
      }),
      FileHandler.configure({
        allowedMimeTypes: IMAGE_TYPES,
        onPaste: (ed, files) => upload(ed, files, ed.state.selection.anchor),
        onDrop: (ed, files, pos) => upload(ed, files, pos),
      }),
    ],
    content: toEditorMarkdown(slug, initialMarkdown),
    contentType: "markdown",
    shouldRerenderOnTransaction: false,
    editorProps: { attributes: { "aria-label": "Conteúdo da página", "aria-multiline": "true", role: "textbox" } },
    onUpdate: ({ editor: ed }) => latest.current.onChange(toDiskMarkdown(ed.getMarkdown())),
  });

  useEffect(() => {
    if (editor) onReady?.(editor);
  }, [editor, onReady]);

  if (!editor) return null;

  return (
    <div>
      <Toolbar editor={editor} onPickImage={pickImage} onEditLink={() => setLinkOpen(true)} />
      <input
        ref={fileInput}
        type="file"
        name="imagem"
        accept={IMAGE_TYPES.join(",")}
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          upload(editor, files, editor.state.selection.anchor);
        }}
      />
      <EditorContent editor={editor} className="editor-content" />
      <LinkPopover editor={editor} open={linkOpen} onClose={() => setLinkOpen(false)} pages={pages} />
      <ImagePopover editor={editor} onAnnotate={(src, alt) => setAnnotating({ src, alt })} />
      {annotating && assetPathFromSrc(annotating.src) && (
        <AnnotationEditor
          slug={slug}
          asset={assetPathFromSrc(annotating.src) ?? ""}
          src={annotating.src}
          alt={annotating.alt}
          pages={pages}
          onClose={() => setAnnotating(null)}
        />
      )}
    </div>
  );
}
