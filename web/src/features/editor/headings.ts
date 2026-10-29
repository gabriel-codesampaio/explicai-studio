import type { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";

export interface Heading {
  pos: number;
  level: number;
  text: string;
}

/** Títulos do primeiro nível do documento (#, ##, ###), na ordem em que aparecem. */
export function headingsOf(editor: Editor): Heading[] {
  const list: Heading[] = [];
  editor.state.doc.forEach((node, pos) => {
    if (node.type.name === "heading") list.push({ pos, level: node.attrs.level as number, text: node.textContent });
  });
  return list;
}

/**
 * Títulos da página, atualizados quando o texto muda (mover o cursor não conta). Começa a contar
 * quando o editor fica pronto: o useEditorState do Tiptap só acordaria na primeira edição.
 */
export function useHeadings(editor: Editor | null): Heading[] {
  const [headings, setHeadings] = useState<Heading[]>([]);
  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const next = headingsOf(editor);
      // Mesmo texto nos títulos: devolve o anterior para não redesenhar a cada tecla.
      setHeadings((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    update();
    editor.on("update", update);
    return () => {
      editor.off("update", update);
    };
  }, [editor]);
  return headings;
}
