import { describe, expect, it } from "vitest";
import type { FontInfo } from "../src/lib/api";
import { manualFontStyle } from "../src/lib/manualFont";

const font = (id: string, family: string, kind: "sans" | "serif", italic: boolean): FontInfo => ({
  id,
  family,
  kind,
  italic,
  files: [],
});
const FONTS = [font("lora", "Lora", "serif", true), font("montserrat", "Montserrat", "sans", false)];

describe("fonte do manual no editor", () => {
  it("sem escolha, não muda nada (fica a fonte da marca)", () => {
    expect(manualFontStyle(FONTS, undefined)).toEqual({});
    expect(manualFontStyle(FONTS, {})).toEqual({});
  });

  it("aplica a fonte do texto com a família de prévia e um reserva do mesmo tipo", () => {
    expect(manualFontStyle(FONTS, { fonts: { text: "lora" } })).toEqual({
      fontFamily: '"Explicaí prévia Lora", serif',
    });
  });

  it("aplica a fonte dos títulos pela variável de títulos do Studio", () => {
    expect(manualFontStyle(FONTS, { fonts: { headings: "montserrat" } })).toEqual({
      "--fonte-display": '"Explicaí prévia Montserrat", sans-serif',
    });
  });

  it("ignora fonte desconhecida e fonte sem itálico no texto", () => {
    expect(manualFontStyle(FONTS, { fonts: { text: "montserrat", headings: "nada" } })).toEqual({});
  });
});
