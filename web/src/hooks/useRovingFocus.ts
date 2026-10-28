import { useCallback, type KeyboardEvent } from "react";

/**
 * Padrão de barra de ferramentas da WAI-ARIA: o Tab entra e sai da barra numa parada só,
 * e as setas (Home/End) andam entre os itens marcados com `data-roving`.
 */
export function useRovingFocus() {
  return useCallback((e: KeyboardEvent<HTMLElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-roving]:not([disabled])"));
    const current = items.indexOf(document.activeElement as HTMLElement);
    if (current === -1) return;
    e.preventDefault();
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : (current + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
    for (const [i, el] of items.entries()) el.tabIndex = i === next ? 0 : -1;
    items[next]?.focus();
  }, []);
}
