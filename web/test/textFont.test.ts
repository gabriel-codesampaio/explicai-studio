import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FONTS } from "../../src/core/export/fonts";
import { TEXT_FONTS } from "../src/features/editor/textFont";
import { EN } from "../src/lib/i18n.en";

const css = readFileSync(path.join(import.meta.dirname, "..", "src", "styles", "editor-content.css"), "utf8");

describe("fonte do trecho", () => {
  it("o editor oferece as mesmas fontes do export, cada uma com regra no CSS e nome em inglês", () => {
    expect(TEXT_FONTS.map((f) => f.id)).toEqual(FONTS.map((f) => f.id));
    for (const f of FONTS) {
      expect(css).toContain(`[data-font="${f.id}"] {`);
      expect(css).toContain(`font-family: "Explicaí prévia ${f.family}"`);
    }
    expect(EN["Fonte do trecho"]).toBeTruthy();
    expect(EN["Fonte padrão"]).toBeTruthy();
  });
});
