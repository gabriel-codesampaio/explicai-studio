import { type KeyboardEvent, useEffect, useRef } from "react";
import type { Shift } from "@/lib/tree";

const SHIFT_KEYS: Record<string, Shift> = { ArrowUp: "up", ArrowDown: "down", ArrowRight: "indent", ArrowLeft: "outdent" };

/**
 * Teclado na árvore de páginas: a árvore é uma parada só do Tab, as setas andam entre as páginas,
 * Alt+Shift+setas reordenam e Shift+F10 (ou a tecla de menu) abre o menu "⋯" da página.
 * Os botões das páginas levam `data-page-id`; a linha, `data-row`; o gatilho do menu, `data-row-menu`.
 */
export function useTreeKeyboard(pagesVersion: unknown, onShift: (id: string, shift: Shift) => void) {
  // Depois de mover, a árvore é redesenhada; o foco volta para a página que foi movida.
  const refocus = useRef<string | null>(null);
  useEffect(() => {
    const id = refocus.current;
    if (!id || pagesVersion === undefined) return;
    refocus.current = null;
    document.querySelector<HTMLElement>(`[data-page-id="${CSS.escape(id)}"]`)?.focus();
  }, [pagesVersion]);

  return (e: KeyboardEvent<HTMLElement>) => {
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
      const trigger = target.closest("[data-row]")?.querySelector<HTMLElement>("[data-row-menu]");
      trigger?.focus();
      // O gatilho do Radix abre com Enter, não com click().
      trigger?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      return;
    }

    const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-page-id]"));
    const i = buttons.indexOf(target);
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
}
