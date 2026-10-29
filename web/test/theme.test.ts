// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { applyAppearance, readAppearance } from "../src/lib/theme";

const KEY = "explicai:aparencia";
const html = readFileSync(path.join(import.meta.dirname, "..", "index.html"), "utf8");
// O script inline que aplica o tema antes da primeira pintura.
const inlineScript = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? "";

describe("aparência gravada antes do T-019, com cor de destaque", () => {
  beforeEach(() => {
    localStorage.setItem(KEY, JSON.stringify({ mode: "dark", accent: "ameixa" }));
    delete document.documentElement.dataset.accent;
    delete document.documentElement.dataset.theme;
  });

  it("o Studio lê só o tema e ignora a cor", () => {
    expect(readAppearance()).toEqual({ mode: "dark" });
    applyAppearance(readAppearance());
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.dataset.accent).toBeUndefined();
  });

  it("o script do index.html faz a mesma leitura", () => {
    expect(inlineScript).not.toBe("");
    new Function(inlineScript)();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.dataset.accent).toBeUndefined();
  });
});
