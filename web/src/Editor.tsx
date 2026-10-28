import FileHandler from "@tiptap/extension-file-handler";
import { EditorContent, useEditor, useEditorState, type Editor as TiptapEditor } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { api, toDiskMarkdown, toEditorMarkdown } from "./api";
import { contentExtensions } from "./extensions";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

interface Props {
  slug: string;
  pageId: string;
  initialMarkdown: string;
  onChange: (markdown: string) => void;
  onError: (message: string) => void;
}

export function Editor({ slug, pageId, initialMarkdown, onChange, onError }: Props) {
  // Callbacks mudam a cada render; o editor é criado uma vez e lê sempre a versão atual.
  const latest = useRef({ slug, onChange, onError });
  latest.current = { slug, onChange, onError };

  const editor = useEditor({
    extensions: [
      ...contentExtensions(),
      FileHandler.configure({
        allowedMimeTypes: IMAGE_TYPES,
        onPaste: (ed, files) => void insertImages(ed, files, ed.state.selection.anchor),
        onDrop: (ed, files, pos) => void insertImages(ed, files, pos),
      }),
    ],
    content: toEditorMarkdown(slug, initialMarkdown),
    contentType: "markdown",
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor: ed }) => latest.current.onChange(toDiskMarkdown(ed.getMarkdown())),
  });

  async function insertImages(ed: TiptapEditor, files: File[], pos: number) {
    for (const file of files) {
      try {
        const { path } = await api.uploadAsset(latest.current.slug, file);
        const src = `/files/${encodeURIComponent(latest.current.slug)}/${path}`;
        ed.chain().focus().insertContentAt(pos, { type: "image", attrs: { src, alt: file.name.replace(/\.[^.]+$/, "") } }).run();
      } catch (err) {
        latest.current.onError(err instanceof Error ? err.message : "Não foi possível enviar a imagem.");
      }
    }
  }

  // Trocar de página troca o conteúdo sem recriar o editor nem disparar salvamento.
  const loadedFor = useRef(pageId);
  useEffect(() => {
    if (!editor || loadedFor.current === pageId) return;
    loadedFor.current = pageId;
    editor.commands.setContent(toEditorMarkdown(slug, initialMarkdown), { contentType: "markdown", emitUpdate: false });
  }, [editor, pageId, slug, initialMarkdown]);

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
          void insertImages(editor, files, editor.state.selection.anchor);
        }}
      />
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}

function Toolbar({ editor, onPickImage }: { editor: TiptapEditor; onPickImage: () => void }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      code: e.isActive("code"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
      link: e.isActive("link"),
      inTable: e.isActive("table"),
    }),
  });
  const c = () => editor.chain().focus();

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Endereço do link (deixe vazio para remover):", prev ?? "https://");
    if (href === null) return;
    if (href.trim() === "") c().unsetLink().run();
    else c().extendMarkRange("link").setLink({ href: href.trim() }).run();
  };

  return (
    <div className="toolbar" role="toolbar" aria-label="Formatação">
      <div className="group">
        <Btn on={s.h1} label="Título 1" onClick={() => c().toggleHeading({ level: 1 }).run()}>T1</Btn>
        <Btn on={s.h2} label="Título 2" onClick={() => c().toggleHeading({ level: 2 }).run()}>T2</Btn>
        <Btn on={s.h3} label="Título 3" onClick={() => c().toggleHeading({ level: 3 }).run()}>T3</Btn>
      </div>
      <div className="group">
        <Btn on={s.bold} label="Negrito (Ctrl+B)" onClick={() => c().toggleBold().run()}><b>N</b></Btn>
        <Btn on={s.italic} label="Itálico (Ctrl+I)" onClick={() => c().toggleItalic().run()}><i>I</i></Btn>
        <Btn on={s.code} label="Código" onClick={() => c().toggleCode().run()}>{"</>"}</Btn>
        <Btn on={s.link} label="Link" onClick={setLink}>Link</Btn>
      </div>
      <div className="group">
        <Btn on={s.bullet} label="Lista" onClick={() => c().toggleBulletList().run()}>• Lista</Btn>
        <Btn on={s.ordered} label="Passos numerados" onClick={() => c().toggleOrderedList().run()}>1. Passos</Btn>
        <Btn on={s.quote} label="Citação" onClick={() => c().toggleBlockquote().run()}>❝</Btn>
        <Btn on={s.codeBlock} label="Bloco de código" onClick={() => c().toggleCodeBlock().run()}>{"{ }"}</Btn>
      </div>
      <div className="group">
        <Btn label="Inserir imagem" onClick={onPickImage}>Imagem</Btn>
        {s.inTable ? (
          <>
            <Btn label="Adicionar linha" onClick={() => c().addRowAfter().run()}>+ Linha</Btn>
            <Btn label="Adicionar coluna" onClick={() => c().addColumnAfter().run()}>+ Coluna</Btn>
            <Btn label="Remover tabela" onClick={() => c().deleteTable().run()}>Remover tabela</Btn>
          </>
        ) : (
          <Btn label="Inserir tabela" onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Tabela</Btn>
        )}
      </div>
    </div>
  );
}

function Btn(props: { on?: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={props.on ? "tb on" : "tb"}
      aria-pressed={props.on}
      aria-label={props.label}
      title={props.label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
