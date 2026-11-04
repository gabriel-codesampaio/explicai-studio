import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MARKER_SIZES, parseStyle, STROKE_SCALE, STYLE_PALETTE, styleVars } from "../src/core/annotationStyle.js";
import { contrast } from "../src/core/export/color.js";
import { MIN_CONTRAST } from "../src/core/export/theme.js";
import { appendAnnotations, createManual, parseAnnotations, readAnnotations, writeAnnotations } from "../src/core/index.js";

const base = { version: 1, markers: [], highlights: [], arrows: [], hotspots: [] };

describe("paleta das marcações", () => {
  it("tem as 6 chaves combinadas", () => {
    expect(Object.keys(STYLE_PALETTE)).toEqual(["cobalt", "ink", "red", "green", "purple", "orange"]);
  });

  it.each(Object.entries(STYLE_PALETTE))("%s passa de MIN_CONTRAST em claro e em escuro, com o número legível", (_key, p) => {
    expect(contrast(p.claro, "#ffffff")).toBeGreaterThanOrEqual(MIN_CONTRAST);
    expect(contrast(p.claro, p.sobre)).toBeGreaterThanOrEqual(MIN_CONTRAST);
    expect(contrast(p.escuro, p.sobreEscuro)).toBeGreaterThanOrEqual(MIN_CONTRAST);
  });

  it("cobalt é o azul de sempre e o degrau m é o tamanho e a espessura de sempre", () => {
    expect(STYLE_PALETTE.cobalt).toMatchObject({ claro: "#2b4fe0", escuro: "#7088ff", sobreEscuro: "#0e1120" });
    expect(MARKER_SIZES.m.disc).toBe(24);
    expect([MARKER_SIZES.s.disc, MARKER_SIZES.l.disc]).toEqual([20, 32]);
    expect(STROKE_SCALE.m).toBe(1);
  });
});

describe("parseStyle", () => {
  it("guarda o que é válido e ignora o resto, campo a campo", () => {
    expect(parseStyle({ color: "red", size: "l", stroke: "s" })).toEqual({ color: "red", size: "l", stroke: "s" });
    expect(parseStyle({ color: "rosa", size: "m", stroke: 3 })).toEqual({ size: "m" });
    expect(parseStyle({ color: "toString" })).toBeUndefined();
  });

  it.each([undefined, null, "red", 4, [], {}, { color: "#ff0000" }])("%j não vira style", (v) => {
    expect(parseStyle(v)).toBeUndefined();
  });

  it("parseAnnotations só leva style quando há algo válido", () => {
    expect(parseAnnotations({ ...base, style: { color: "ink" } }).style).toEqual({ color: "ink" });
    expect(parseAnnotations({ ...base, style: { color: "rosa" } })).not.toHaveProperty("style");
    expect(parseAnnotations(base)).not.toHaveProperty("style");
  });
});

describe("styleVars", () => {
  it("sem estilo ou vazio não gera variável", () => {
    expect(styleVars(undefined)).toEqual({});
    expect(styleVars({})).toEqual({});
  });

  it("só as escolhidas; export usa a cor clara, Studio usa light-dark", () => {
    expect(styleVars({ stroke: "l" })).toEqual({ "--marca-espessura": "1.5" });
    expect(styleVars({ color: "red", size: "s" })).toMatchObject({
      "--anotacao": "#c4261d",
      "--sobre-anotacao": "#ffffff",
      "--disco": "20px",
    });
    expect(styleVars({ color: "red" }, true)["--anotacao"]).toBe("light-dark(#c4261d,#ff8a80)");
  });
});

describe("a cópia do editor é idêntica", () => {
  it("web/src/lib/annotationStyle.ts == src/core/annotationStyle.ts", async () => {
    const [core, web] = await Promise.all(
      ["../src/core/annotationStyle.ts", "../web/src/lib/annotationStyle.ts"].map((f) =>
        readFile(new URL(f, import.meta.url), "utf8"),
      ),
    );
    expect(web).toBe(core);
  });
});

describe("gravar e regravar", () => {
  let workspace: string;
  let dir: string;
  beforeEach(async () => {
    workspace = await mkdtemp(path.join(tmpdir(), "explicai-style-"));
    dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
  });
  afterEach(async () => {
    await rm(workspace, { recursive: true, force: true });
  });

  it("style sobrevive a escrever, ler e a acrescentar marcações (caminho do annotate_image)", async () => {
    const asset = "assets/tela.png";
    await writeAnnotations(dir, asset, { ...base, style: { color: "purple", size: "s", stroke: "l" } });
    expect((await readAnnotations(dir, asset)).style).toEqual({ color: "purple", size: "s", stroke: "l" });
    await appendAnnotations(dir, asset, { markers: [{ x: 0.2, y: 0.2, label: "Um" }] });
    const after = await readAnnotations(dir, asset);
    expect(after.style).toEqual({ color: "purple", size: "s", stroke: "l" });
    expect(after.markers).toHaveLength(1);
  });

  it("abrir arquivo sem style não grava style", async () => {
    await writeAnnotations(dir, "assets/a.png", base);
    expect(await readAnnotations(dir, "assets/a.png")).not.toHaveProperty("style");
  });
});
