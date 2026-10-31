import type { Editor } from "@tiptap/react";
import { type RefObject, useEffect, useReducer, useRef, useState } from "react";

export interface TableTarget {
  /** Célula onde as alças se apoiam: a que está sob o mouse ou, sem mouse, a do cursor. */
  cell: HTMLElement;
  /** Posição da célula no documento. */
  pos: number;
}

/** Célula do cursor, ou null quando o cursor está fora de tabela. */
function selectedCell(editor: Editor): HTMLElement | null {
  const { $from } = editor.state.selection;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === "tableCell" || $from.node(d).type.name === "tableHeader") {
      const dom = editor.view.nodeDOM($from.before(d));
      return dom instanceof HTMLElement ? dom : null;
    }
  }
  return null;
}

/**
 * Acompanha a célula para onde apontar os controles da tabela: a sob o mouse (dentro de `host`) ou a do cursor.
 * `pin(true)` segura a célula enquanto um menu está aberto, porque o mouse sai da tabela para chegar nele.
 */
export function useTableTarget(editor: Editor, host: RefObject<HTMLElement | null>) {
  const [hover, setHover] = useState<HTMLElement | null>(null);
  const [, redraw] = useReducer((n: number) => n + 1, 0);
  const pinned = useRef(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (pinned.current || !target || target.closest("[data-table-controls]")) return;
      const cell = target.closest("td, th");
      setHover(cell && el.contains(cell) ? (cell as HTMLElement) : null);
    };
    const leave = () => !pinned.current && setHover(null);
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    editor.on("transaction", redraw);
    const resize = new ResizeObserver(redraw);
    resize.observe(el);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
      editor.off("transaction", redraw);
      resize.disconnect();
    };
  }, [editor, host]);

  const cell = hover?.isConnected ? hover : selectedCell(editor);
  let target: TableTarget | null = null;
  if (cell) {
    try {
      target = { cell, pos: editor.view.posAtDOM(cell, 0) - 1 };
    } catch {
      // A célula saiu do documento entre dois desenhos: sem alças até o próximo.
    }
  }
  const pin = (on: boolean) => {
    pinned.current = on;
  };
  return { target, pin };
}
