import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");
const bloco = (sel: string) => css.slice(css.indexOf(sel)).split("}")[0];
const token = (b: string, n: string) => new RegExp(`--${n}: *(#[0-9a-f]{6})`, "i").exec(b)?.[1] ?? "";

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const temas = { claro: bloco(":root {"), escuro: bloco(':root[data-theme="dark"]') };
const herdado = (tema: keyof typeof temas, n: string) => token(temas[tema], n) || token(temas.claro, n);

describe.each(["claro", "escuro"] as const)("contraste AA no tema %s", (t) => {
  const t_ = (n: string) => herdado(t, n);
  const pares: [string, string, string, number][] = [
    ["tinta/papel", "tinta", "papel", 4.5],
    ["tinta/superficie", "tinta", "superficie", 4.5],
    ["grafite/papel", "grafite", "papel", 4.5],
    ["grafite/superficie", "grafite", "superficie", 4.5],
    ["cobalto/papel", "cobalto", "papel", 4.5],
    ["cobalto/superficie", "cobalto", "superficie", 4.5],
    ["sobre-cobalto/cobalto (botao)", "sobre-cobalto", "cobalto", 4.5],
    ["sobre-anotacao/anotacao (numero)", "sobre-anotacao", "anotacao", 4.5],
    ["coral/papel", "coral", "papel", 4.5],
    ["coral/superficie", "coral", "superficie", 4.5],
    ["input/papel (borda)", "input", "papel", 3],
  ];
  it.each(pares)("%s", (_n, fg, bg, min) => {
    expect(contraste(t_(fg), t_(bg))).toBeGreaterThanOrEqual(min);
  });
});
