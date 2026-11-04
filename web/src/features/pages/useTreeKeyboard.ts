import { type KeyboardEvent, useEffect, useRef } from "react";
import type { Shift } from "@/lib/tree";

const SHIFT_KEYS: Record<string, Shift> = { ArrowUp: "up", ArrowDown: "down", ArrowRight: "indent", ArrowLeft: "outdent" };

/**
 * Teclado na árvore de páginas: a árvore é uma parada só do Tab, as setas andam entre as páginas,
 * Alt+Shift+setas reordenam, Shift+F10 (ou a tecla de menu) abre o menu "⋯" da página e digitar
 * a inicial do título foca a página. Os botões das páginas levam `data-page-id` e `data-page-title`. Devolve o tratador de teclas e a ref da lista raiz.
 */
export function useTreeKeyboard(
  pagesVersion: unknown,
  onShift: (id: string, shift: Shift) => void,
  onOpenMenu: (id: string) => void,
) {
  const root = useRef<HTMLUListElement>(null);
  // Depois de mover, a árvore é redesenhada; o foco volta para a página que foi movida.
  const refocus = useRef<string | null>(null);
  useEffect(() => {
    const id = refocus.current;
    if (!id || pagesVersion === undefined) return;
    refocus.current = null;
    root.current?.querySelector<HTMLElement>(`[data-page-id="${CSS.escape(id)}"]`)?.focus();
  }, [pagesVersion]);

  // Busca por digitação: as letras seguidas (pausa de 700 ms zera) levam à página cujo título começa com elas.
  const typed = useRef({ text: "", at: 0 });

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const id = target.dataset.pageId;
    if (!id) return;

    const shift = SHIFT_KEYS[e.key];
    if (e.altKey && e.shiftKey && shift) {
      e.preventDefault();
      refocus.current = id;
      onShift(id, shift);
      return;
    }

    if ((e.shiftKey && e.key === "F10") || e.key === "ContextMenu") {
      e.preventDefault();
      onOpenMenu(id);
      return;
    }

    const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-page-id]"));
    const i = buttons.indexOf(target);

    // Espaço no começo da busca continua sendo o clique do botão.
    const isChar = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
    const now = Date.now();
    const fresh = now - typed.current.at > 700;
    if (isChar && !(e.key === " " && (fresh || !typed.current.text))) {
      e.preventDefault();
      const text = (fresh ? "" : typed.current.text) + e.key.toLowerCase();
      typed.current = { text, at: now };
      // Uma letra só (ou repetida) anda para a próxima página com a inicial; mais letras refinam a atual.
      const repeated = [...text].every((c) => c === e.key.toLowerCase());
      const start = repeated ? i + 1 : i;
      const query = repeated ? e.key.toLowerCase() : text;
      for (let k = 0; k < buttons.length; k++) {
        const el = buttons[(start + k) % buttons.length];
        if (el?.dataset.pageTitle?.toLowerCase().startsWith(query)) {
          el.focus();
          break;
        }
      }
      return;
    }
    const next =
      e.key === "ArrowDown"
        ? i + 1
        : e.key === "ArrowUp"
          ? i - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? buttons.length - 1
              : null;
    const el = next === null ? undefined : buttons[next];
    if (!el) return;
    e.preventDefault();
    el.focus();
  };

  return { onKeyDown, root };
}
