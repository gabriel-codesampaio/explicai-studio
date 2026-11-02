// @vitest-environment happy-dom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { COLUMN_MIN_REM, useSidebar } from "../src/hooks/useSidebar";

/** Finge uma janela com a largura dada: só entende "(min-width: Nrem)", que é o que o hook pergunta. */
function windowOf(px: number) {
  vi.stubGlobal("matchMedia", (q: string) => ({ matches: px >= Number(/([\d.]+)rem/.exec(q)?.[1]) * 16 }));
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("useSidebar", () => {
  it("a coluna começa em 900 px (tela dividida), não em 1024", () => {
    expect(COLUMN_MIN_REM * 16).toBe(900);
  });

  it.each([900, 960, 1023, 1440])("em %i px o atalho recolhe a coluna e não abre a gaveta", (px) => {
    windowOf(px);
    const { result } = renderHook(() => useSidebar());
    act(() => result.current.toggle());
    expect(result.current.collapsed).toBe(true);
    expect(result.current.drawerOpen).toBe(false);
  });

  it.each([375, 899])("em %i px o atalho abre a gaveta e não mexe na coluna", (px) => {
    windowOf(px);
    const { result } = renderHook(() => useSidebar());
    act(() => result.current.toggle());
    expect(result.current.drawerOpen).toBe(true);
    expect(result.current.collapsed).toBe(false);
  });
});
