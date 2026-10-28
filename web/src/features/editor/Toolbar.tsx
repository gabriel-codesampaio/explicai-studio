import { useEditorState, type Editor } from "@tiptap/react";
import { ToolbarButton as Btn } from "./ToolbarButton";

interface Props {
  editor: Editor;
  onPickImage: () => void;
}

export function Toolbar({ editor, onPickImage }: Props) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      code: e.isActive("code"),
      link: e.isActive("link"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
      inTable: e.isActive("table"),
    }),
  });
  const chain = () => editor.chain().focus();

  // shortcut: prompt do navegador; trocar por um campo no próprio editor junto com o menu "/".
  const editLink = () => {
    const current = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Endereço do link (deixe vazio para remover):", current ?? "https://");
    if (href === null) return;
    if (href.trim() === "") chain().unsetLink().run();
    else chain().extendMarkRange("link").setLink({ href: href.trim() }).run();
  };

  return (
    <div className="toolbar" role="toolbar" aria-label="Formatação">
      <div className="group">
        <Btn active={s.h1} label="Título 1" onClick={() => chain().toggleHeading({ level: 1 }).run()}>T1</Btn>
        <Btn active={s.h2} label="Título 2" onClick={() => chain().toggleHeading({ level: 2 }).run()}>T2</Btn>
        <Btn active={s.h3} label="Título 3" onClick={() => chain().toggleHeading({ level: 3 }).run()}>T3</Btn>
      </div>
      <div className="group">
        <Btn active={s.bold} label="Negrito (Ctrl+B)" onClick={() => chain().toggleBold().run()}><b>N</b></Btn>
        <Btn active={s.italic} label="Itálico (Ctrl+I)" onClick={() => chain().toggleItalic().run()}><i>I</i></Btn>
        <Btn active={s.code} label="Código" onClick={() => chain().toggleCode().run()}>{"</>"}</Btn>
        <Btn active={s.link} label="Link" onClick={editLink}>Link</Btn>
      </div>
      <div className="group">
        <Btn active={s.bullet} label="Lista" onClick={() => chain().toggleBulletList().run()}>• Lista</Btn>
        <Btn active={s.ordered} label="Passos numerados" onClick={() => chain().toggleOrderedList().run()}>1. Passos</Btn>
        <Btn active={s.quote} label="Citação" onClick={() => chain().toggleBlockquote().run()}>❝</Btn>
        <Btn active={s.codeBlock} label="Bloco de código" onClick={() => chain().toggleCodeBlock().run()}>{"{ }"}</Btn>
      </div>
      <div className="group">
        <Btn label="Inserir imagem" onClick={onPickImage}>Imagem</Btn>
        {s.inTable ? (
          <>
            <Btn label="Adicionar linha" onClick={() => chain().addRowAfter().run()}>+ Linha</Btn>
            <Btn label="Adicionar coluna" onClick={() => chain().addColumnAfter().run()}>+ Coluna</Btn>
            <Btn label="Remover tabela" onClick={() => chain().deleteTable().run()}>Remover tabela</Btn>
          </>
        ) : (
          <Btn label="Inserir tabela" onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
            Tabela
          </Btn>
        )}
      </div>
    </div>
  );
}
