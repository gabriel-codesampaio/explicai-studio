import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrast } from "../../src/core/export/color";
import { TEXT_COLORS as EXPORT_COLORS } from "../../src/core/export/textColors";
import { TEXT_COLORS } from "../src/features/editor/textColor";

const styles = path.join(import.meta.dirname, "..", "src", "styles");
const tokens = readFileSync(path.join(styles, "tokens.css"), "utf8");
const editorCss = readFileSync(path.join(styles, "editor-content.css"), "utf8");
const [light = "", dark = ""] = tokens.split(':root[data-theme="dark"]');
const token = (block: string, name: string) => new RegExp(`--${name}: *(#[0-9a-f]{6})`).exec(block)?.[1] ?? "";

describe("paleta da cor do texto", () => {
  it("editor e export usam os mesmos nomes, e cada um tem regra no CSS do editor", () => {
    expect(Object.keys(EXPORT_COLORS)).toEqual([...TEXT_COLORS]);
    for (const name of TEXT_COLORS) {
      expect(editorCss).toMatch(new RegExp(`\\[data-color="${name}"\\] \\{\\s*color: var\\(--cor-${name}\\);`));
    }
  });

  it("cada cor tem contraste AA no papel e na superfície, no claro e no escuro", () => {
    for (const [block, label] of [
      [light, "claro"],
      [dark, "escuro"],
    ] as const) {
      for (const name of TEXT_COLORS) {
        const color = token(block, `cor-${name}`);
        for (const bg of [token(block, "papel"), token(block, "superficie") || token(light, "superficie")]) {
          expect(contrast(color, bg), `${name} no ${label} sobre ${bg}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
});
