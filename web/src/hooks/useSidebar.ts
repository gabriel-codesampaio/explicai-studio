import { useEffect, useEffectEvent, useState } from "react";

const KEY = "explicai:barra-lateral";
/** A partir desta largura (lg) a barra lateral é uma coluna; abaixo, uma gaveta por cima do editor. */
const WIDE = "(min-width: 64rem)";

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(KEY) === "recolhida";
  } catch {
    return false;
  }
}

/**
 * Barra lateral das páginas. Em tela larga ela recolhe e abre (e o navegador lembra). Em tela estreita,
 * como a do sistema dividida ao lado, ela fica fechada e abre como gaveta. Ctrl+\ alterna nos dois casos.
 */
export function useSidebar() {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const setColumn = (next: boolean) => {
    try {
      localStorage.setItem(KEY, next ? "recolhida" : "aberta");
    } catch {
      // Sem armazenamento (janela privada): vale até fechar a aba.
    }
    setCollapsed(next);
  };
  const toggle = () => (window.matchMedia(WIDE).matches ? setColumn(!collapsed) : setDrawerOpen(!drawerOpen));

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
      e.preventDefault();
      toggle();
    }
  });
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return {
    collapsed,
    drawerOpen,
    toggle,
    collapse: () => setColumn(true),
    expand: () => setColumn(false),
    setDrawerOpen,
  };
}

export type SidebarState = ReturnType<typeof useSidebar>;
