import { type RefObject, useEffect, useState } from "react";

export interface Edges {
  /** Há conteúdo escondido à esquerda. */
  start: boolean;
  /** Há conteúdo escondido à direita. */
  end: boolean;
}

/** Folga de 1 px: scrollLeft é fracionário em telas com zoom. */
export function scrollEdges(el: Pick<HTMLElement, "scrollLeft" | "clientWidth" | "scrollWidth">): Edges {
  return { start: el.scrollLeft > 1, end: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 };
}

/**
 * Diz se a barra rolável tem conteúdo escondido de cada lado, e faz a roda do mouse (vertical)
 * rolar a barra de lado quando ela só rola na horizontal.
 */
export function useScrollEdges(ref: RefObject<HTMLElement | null>): Edges {
  const [edges, setEdges] = useState<Edges>({ start: false, end: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const next = scrollEdges(el);
      setEdges((prev) => (prev.start === next.start && prev.end === next.end ? prev : next));
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || el.scrollWidth <= el.clientWidth) return;
      const { start, end } = scrollEdges(el);
      if ((e.deltaY < 0 && !start) || (e.deltaY > 0 && !end)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const mo = new MutationObserver(update); // botões que entram e saem (tabela) mudam a largura
    mo.observe(el, { childList: true });
    return () => {
      el.removeEventListener("scroll", update);
      el.removeEventListener("wheel", onWheel);
      ro.disconnect();
      mo.disconnect();
    };
  }, [ref]);
  return edges;
}
