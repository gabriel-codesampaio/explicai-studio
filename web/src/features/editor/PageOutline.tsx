import { type Editor, useEditorState } from "@tiptap/react";

interface Heading {
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

/** Índice "Nesta página": acompanha os títulos enquanto a pessoa escreve e leva até eles no clique. */
export function PageOutline({ editor }: { editor: Editor }) {
  // A comparação padrão é profunda: o índice só redesenha quando os títulos mudam, não a cada tecla.
  const headings = useEditorState({ editor, selector: ({ editor: ed }) => headingsOf(ed) });
  if (headings.length === 0) return null;

  const go = (h: Heading) => {
    editor
      .chain()
      .focus()
      .setTextSelection(h.pos + 1)
      .run();
    (editor.view.nodeDOM(h.pos) as HTMLElement | null)?.scrollIntoView({ block: "start" });
  };

  return (
    <nav aria-label="Nesta página" className="text-[13px]">
      <p className="mb-2 font-bold text-muted-foreground">Nesta página</p>
      <ul className="grid gap-0.5 border-l border-border">
        {headings.map((h) => (
          <li key={h.pos}>
            <button
              type="button"
              onClick={() => go(h)}
              className="-ml-px block w-full truncate border-l-2 border-transparent py-1 pr-2 text-left text-muted-foreground hover:border-primary hover:text-foreground"
              style={{ paddingLeft: `${0.75 * h.level}rem` }}
            >
              {h.text || "Título vazio"}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
