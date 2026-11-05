// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { GuidedTour } from "../src/features/help/GuidedTour";
import {
  findTarget,
  isTourSeen,
  markTourSeen,
  shouldAutoOpen,
  sideFor,
  TOUR_EVENT,
  TOUR_KEY,
  TOUR_STEPS,
} from "../src/features/help/tourSteps";
import { EN } from "../src/lib/i18n.en";

afterEach(() => {
  cleanup();
  localStorage.clear();
  history.replaceState(null, "", "/");
});

const mem = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};

it("3 a 4 passos, todos traduzidos", () => {
  expect(TOUR_STEPS.length).toBeGreaterThanOrEqual(3);
  expect(TOUR_STEPS.length).toBeLessThanOrEqual(4);
  const texts = TOUR_STEPS.flatMap((s) => [s.title, s.body]);
  expect(texts.filter((x) => !(x in EN))).toEqual([]);
});

it("abre só na primeira vez e nunca sob automação, salvo ?passeio=1", () => {
  const base = { seen: false, webdriver: false, search: "", emptyManual: true };
  expect(shouldAutoOpen(base)).toBe(true);
  expect(shouldAutoOpen({ ...base, seen: true })).toBe(false);
  expect(shouldAutoOpen({ ...base, emptyManual: false })).toBe(false); // quem já tem páginas
  expect(shouldAutoOpen({ ...base, emptyManual: false, search: "?passeio=1" })).toBe(true);
  expect(shouldAutoOpen({ ...base, webdriver: true })).toBe(false);
  expect(shouldAutoOpen({ ...base, seen: true, webdriver: true, search: "?passeio=1" })).toBe(true);
});

it("visto fica no storage e falha de storage não quebra", () => {
  const s = mem();
  expect(isTourSeen(s)).toBe(false);
  markTourSeen(s);
  expect(s.getItem(TOUR_KEY)).toBe("1");
  expect(isTourSeen(s)).toBe(true);
  const broken = {
    getItem: () => {
      throw new Error("x");
    },
    setItem: () => {
      throw new Error("x");
    },
  };
  expect(isTourSeen(broken)).toBe(false);
  expect(() => markTourSeen(broken)).not.toThrow();
});

it("alvo ausente ou sem tamanho devolve null", () => {
  const step = { target: "#nada", title: "", body: "" };
  expect(findTarget(step)).toBeNull();
  document.body.innerHTML = '<i id="nada"></i>';
  expect(findTarget(step)).toBeNull(); // happy-dom: tamanho 0, como menu fechado
});

it("alvo oculto aponta para o botão do menu lateral, se ele aparece", () => {
  const box = (id: string, w: number) => {
    document.body.innerHTML = `<i id="alvo"></i><b data-passeio="menu"></b>`;
    const rect = (width: number) => () => ({ width, height: width }) as DOMRect;
    for (const [el, width] of [
      [document.getElementById("alvo"), 0],
      [document.querySelector("[data-passeio=menu]"), w],
    ] as const)
      if (el) el.getBoundingClientRect = rect(width);
    return findTarget({ target: `#${id}`, title: "", body: "" });
  };
  expect(box("alvo", 40)?.getAttribute("data-passeio")).toBe("menu");
  expect(box("alvo", 0)).toBeNull();
});

it("abre com ?passeio=1, é um dialog nomeado, Pular fecha e grava visto", () => {
  history.replaceState(null, "", "/?passeio=1");
  render(<GuidedTour emptyManual />);
  const dialog = screen.getByRole("dialog", { name: "Crie uma página" });
  expect(dialog).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Próximo" }));
  expect(screen.getByRole("dialog", { name: "Cole um print" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Pular passeio" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(localStorage.getItem(TOUR_KEY)).toBe("1");
});

it("Esc fecha e o evento do menu reabre", async () => {
  history.replaceState(null, "", "/?passeio=1");
  render(<GuidedTour emptyManual />);
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
  window.dispatchEvent(new Event(TOUR_EVENT));
  expect(await screen.findByRole("dialog")).toBeTruthy();
});

it("sideFor: sem alvo em cima, alvo alto ao lado, baixo embaixo", () => {
  const el = (h: number) => ({ getBoundingClientRect: () => ({ height: h }) }) as Element;
  expect(sideFor(null, 800)).toBe("top");
  expect(sideFor(el(600), 800)).toBe("left");
  expect(sideFor(el(40), 800)).toBe("bottom");
});
