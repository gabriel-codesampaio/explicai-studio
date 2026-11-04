import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  BORDER_PX,
  HIGHLIGHT_FILL_ALPHA,
  HIGHLIGHT_PALETTE,
  parseItemStyle,
  resolveItemStyle,
  styleVars,
} from "../src/core/annotationStyle.js";
import { contrast, overWhite } from "../src/core/export/color.js";
import { addPage, createManual, exportManual, saveAsset, writeAnnotations } from "../src/core/index.js";

const INK = "#151a33";
const gray = (hex: string) => {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
};

describe("paleta de marca-texto", () => {
  it("tem as 5 chaves combinadas", () => {
    expect(Object.keys(HIGHLIGHT_PALETTE)).toEqual(["yellow", "green", "pink", "blue", "orange"]);
  });

  it.each(Object.entries(HIGHLIGHT_PALETTE))(
    "%s: borda 3:1 contra branco, borda mais escura que o fundo, texto 4,5:1 em suave e cheio",
    (_k, p) => {
      expect(contrast(p.border, "#ffffff")).toBeGreaterThanOrEqual(3);
      expect(gray(p.border)).toBeLessThan(gray(p.fill));
      for (const f of ["soft", "solid"] as const) {
        expect(contrast(INK, overWhite(p.fill, HIGHLIGHT_FILL_ALPHA[f]))).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it.each(Object.entries(HIGHLIGHT_PALETTE))(
    "%s: em escala de cinza cheio, suave e sem se distinguem (>= 12 níveis)",
    (_k, p) => {
      const g = (a: number) => gray(overWhite(p.fill, a));
      const [solid, soft, none] = [g(HIGHLIGHT_FILL_ALPHA.solid), g(HIGHLIGHT_FILL_ALPHA.soft), g(HIGHLIGHT_FILL_ALPHA.none)];
      expect(none - soft).toBeGreaterThanOrEqual(12);
      expect(soft - solid).toBeGreaterThanOrEqual(12);
    },
  );

  it("bordas s, m e l têm px diferentes e inteiros", () => {
    expect(new Set(Object.values(BORDER_PX)).size).toBe(3);
    for (const px of Object.values(BORDER_PX)) expect(Number.isInteger(px)).toBe(true);
  });
});

describe("estilo do destaque", () => {
  it("aceita cor de marca-texto, fill e border; recusa cor de outro tipo", () => {
    expect(parseItemStyle("highlight", { color: "pink", fill: "soft", border: "l" })).toEqual({
      color: "pink",
      fill: "soft",
      border: "l",
    });
    expect(parseItemStyle("highlight", { color: "green" })).toEqual({ color: "green" });
    expect(parseItemStyle("highlight", { color: "red" })).toBeUndefined();
    expect(parseItemStyle("marker", { color: "pink" })).toBeUndefined();
  });

  it("sem preenchimento e sem borda é recusado: a borda volta a s", () => {
    expect(parseItemStyle("highlight", { fill: "none", border: "none" })).toEqual({ fill: "none", border: "s" });
    expect(resolveItemStyle({ fill: "none" }, { border: "none" })).toEqual({ fill: "none", border: "s" });
  });

  it("nenhuma borda vale nos 4 tipos", () => {
    for (const k of ["marker", "arrow", "highlight", "hotspot"] as const) {
      expect(parseItemStyle(k, { border: "none" })).toEqual({ border: "none" });
    }
  });

  it("variáveis: cor sem multiply, fill none transparente, sem estilo nada muda", () => {
    const v = styleVars({ color: "blue", fill: "none", border: "m" }, false, "highlight");
    expect(v["--hl-mistura"]).toBe("normal");
    expect(v["--hl-fundo"]).toMatch(/,0\)$/);
    expect(v["--hl-borda"]).toBe(HIGHLIGHT_PALETTE.blue.border);
    const soFill = styleVars({ fill: "soft" }, false, "highlight");
    expect(soFill["--hl-fundo"]).toContain("var(--marca)");
    expect(soFill["--hl-borda"]).toBeUndefined();
    expect(styleVars({ color: "red" as never, fill: "soft" }, false, "highlight")["--hl-fundo"]).toContain("var(--marca)");
    expect(styleVars({ border: "m" }, false, "highlight")["--hl-mistura"]).toBeUndefined();
    expect(styleVars(undefined, false, "highlight")).toEqual({});
  });
});

describe("export do destaque", () => {
  it("cor e preenchimento viram variáveis no span e a regra sem multiply entra no CSS", async () => {
    const ws = await mkdtemp(path.join(tmpdir(), "explicai-hl-"));
    try {
      const { dir } = await createManual(ws, { title: "H", language: "pt-BR" });
      const asset = await saveAsset(dir, "tela.png", new Uint8Array([1, 2, 3]));
      await writeAnnotations(dir, asset, {
        version: 1,
        markers: [],
        arrows: [],
        hotspots: [],
        highlights: [{ id: "h1", x: 0.1, y: 0.1, w: 0.2, h: 0.1, style: { color: "pink", fill: "none", border: "none" } }],
      });
      await addPage(dir, { title: "P", body: `![Tela](../${asset})` });
      const h = await readFile(path.join(dir, (await exportManual(dir, "html")).file), "utf8");
      const span = /<span class="hl" style="([^"]*)"/.exec(h)?.[1] ?? "";
      expect(span).toContain("--hl-mistura:normal");
      expect(span).toContain(`--hl-borda:${HIGHLIGHT_PALETTE.pink.border}`);
      // fill none e border none juntos: a borda volta a 1px
      expect(span).toContain("--borda:1px");
      expect(h).toContain("var(--hl-mistura,multiply)");
    } finally {
      await rm(ws, { recursive: true, force: true });
    }
  });
});
