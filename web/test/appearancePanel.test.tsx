// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as theme from "../src/lib/theme";
import { AppearancePanel } from "../src/features/settings/AppearancePanel";

const KEY = "explicai:aparencia";
afterEach(cleanup);
beforeEach(() => {
  localStorage.clear();
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as never;
});

const pressed = () =>
  screen
    .getAllByRole("button")
    .filter((b) => b.getAttribute("aria-pressed") === "true")
    .map((b) => b.textContent?.trim());

describe("AppearancePanel: uma só opção marcada", () => {
  it.each([
    [JSON.stringify({ mode: "light" }), "Claro"],
    [JSON.stringify({ mode: "dark" }), "Escuro"],
    [JSON.stringify({ mode: "system" }), "Sistema"],
    [null, "Sistema"],
    ["lixo{", "Sistema"],
  ])("gravado %s marca %s", (saved, label) => {
    if (saved !== null) localStorage.setItem(KEY, saved);
    render(<AppearancePanel open onOpenChange={() => {}} />);
    expect(pressed()).toEqual([label]);
  });
});

describe("AppearancePanel: foco", () => {
  it("abre com o foco na opção marcada, não na primeira", async () => {
    localStorage.setItem(KEY, JSON.stringify({ mode: "dark" }));
    render(<AppearancePanel open onOpenChange={() => {}} />);
    await vi.waitFor(() => expect(document.activeElement?.textContent?.trim()).toBe("Escuro"));
  });

  it("sem opção marcada, o foco cai na primeira", async () => {
    vi.spyOn(theme, "readAppearance").mockReturnValue({ mode: "nenhum" } as never);
    render(<AppearancePanel open onOpenChange={() => {}} />);
    await vi.waitFor(() => expect(document.activeElement?.textContent?.trim()).toBe("Claro"));
    vi.restoreAllMocks();
  });
});
