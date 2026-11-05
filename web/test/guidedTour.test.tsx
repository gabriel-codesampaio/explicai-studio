// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { GuidedTour } from "../src/features/help/GuidedTour";
import {
  findTarget,
  isTourSeen,
  markTourSeen,
  shouldAutoOpen,
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
  const base = { seen: false, webdriver: false, search: "" };
  expect(shouldAutoOpen(base)).toBe(true);
  expect(shouldAutoOpen({ ...base, seen: true })).toBe(false);
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

it("abre com ?passeio=1, é um dialog nomeado, Pular fecha e grava visto", () => {
  history.replaceState(null, "", "/?passeio=1");
  render(<GuidedTour />);
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
  render(<GuidedTour />);
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
  window.dispatchEvent(new Event(TOUR_EVENT));
  expect(await screen.findByRole("dialog")).toBeTruthy();
});
