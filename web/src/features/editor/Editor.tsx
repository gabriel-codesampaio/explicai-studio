import FileHandler from "@tiptap/extension-file-handler";
import { EditorContent, useEditor } from "@tiptap/react";
import { useRef } from "react";
import { toDiskMarkdown, toEditorMarkdown } from "../../lib/imagePaths";
import { contentExtensions } from "./extensions";
import { IMAGE_TYPES, insertImages } from "./imageUpload";
import { Toolbar } from "./Toolbar";

interface Props {
  slug: string;
  /** Markdown como está no disco. O editor é recriado por página (key no componente pai). */
  initialMarkdown: string;
  onChange: (markdown: string) => void;
  onError: (message: string) => void;
}

export function Editor({ slug, initialMarkdown, onChange, onError }: Props) {
  // Os callbacks mudam a cada render; as extensões são criadas uma vez e leem sempre a versão atual.
  const latest = useRef({ slug, onChange, onError });
  latest.current = { slug, onChange, onError };
  const upload = (files: File[], pos: number) => {
    if (editor) void insertImages(editor, latest.current.slug, files, pos, latest.current.onError);
  };

  const editor = useEditor({
    extensions: [
      ...contentExtensions(),
      FileHandler.configure({
        allowedMimeTypes: IMAGE_TYPES,
        onPaste: (ed, files) => void insertImages(ed, latest.current.slug, files, ed.state.selection.anchor, latest.current.onError),
        onDrop: (ed, files, pos) => void insertImages(ed, latest.current.slug, files, pos, latest.current.onError),
      }),
    ],
    content: toEditorMarkdown(slug, initialMarkdown),
    contentType: "markdown",
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor: ed }) => latest.current.onChange(toDiskMarkdown(ed.getMarkdown())),
  });

  const fileInput = useRef<HTMLInputElement>(null);
  if (!editor) return null;

  return (
    <div className="editor">
      <Toolbar editor={editor} onPickImage={() => fileInput.current?.click()} />
      <input
        ref={fileInput}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          upload(files, editor.state.selection.anchor);
        }}
      />
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
