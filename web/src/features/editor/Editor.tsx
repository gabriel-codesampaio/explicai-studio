import FileHandler from "@tiptap/extension-file-handler";
import { EditorContent, useEditor, type Editor as TiptapEditor } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { toDiskMarkdown, toEditorMarkdown } from "@/lib/imagePaths";
import { contentExtensions } from "./extensions";
import { IMAGE_TYPES, insertImages } from "./imageUpload";
import { SlashCommand } from "./slash/slashCommand";
import { Toolbar } from "./Toolbar";

interface Props {
  slug: string;
  /** Markdown como está no disco. O editor é recriado por página (key no componente pai). */
  initialMarkdown: string;
  onChange: (markdown: string) => void;
  onError: (message: string) => void;
  /** Entrega a instância do editor ao pai (ex.: Enter no título leva o cursor para o texto). */
  onReady?: (editor: TiptapEditor) => void;
}

export function Editor({ slug, initialMarkdown, onChange, onError, onReady }: Props) {
  // Os callbacks mudam a cada render; as extensões são criadas uma vez e leem sempre a versão atual.
  const latest = useRef({ slug, onChange, onError });
  latest.current = { slug, onChange, onError };
  const fileInput = useRef<HTMLInputElement>(null);
  const pickImage = () => fileInput.current?.click();
  const upload = (ed: TiptapEditor, files: File[], pos: number) =>
    void insertImages(ed, latest.current.slug, files, pos, latest.current.onError);

  const editor = useEditor({
    extensions: [
      ...contentExtensions(),
      SlashCommand.configure({ pickImage }),
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

  // shortcut: prompt do navegador; trocado pelo balão de link no próximo passo.
  const editLink = () => {
    if (!editor) return;
    const current = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Endereço do link (deixe vazio para remover):", current ?? "https://");
    if (href === null) return;
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href.trim() === "") chain.unsetLink().run();
    else chain.setLink({ href: href.trim() }).run();
  };

  if (!editor) return null;

  return (
    <div>
      <Toolbar editor={editor} onPickImage={pickImage} onEditLink={editLink} />
      <input
        ref={fileInput}
        type="file"
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
    </div>
  );
}
