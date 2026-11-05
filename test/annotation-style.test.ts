import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  arrowHalo,
  BORDER_PX,
  MARKER_SIZES,
  parseStyle,
  STROKE_SCALE,
  STYLE_PALETTE,
  styleVars,
} from "../src/core/annotationStyle.js";
import { contrast } from "../src/core/export/color.js";
import { MIN_CONTRAST } from "../src/core/export/theme.js";
import {
  addPage,
  appendAnnotations,
  createManual,
  exportManual,
  parseAnnotations,
  readAnnotations,
  saveAsset,
  writeAnnotations,
} from "../src/core/index.js";

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

  it("border aceita none, s, m, l e ignora o resto", () => {
    for (const b of ["none", "s", "m", "l"]) expect(parseStyle({ border: b })).toEqual({ border: b });
    expect(parseStyle({ border: "xl" })).toBeUndefined();
    expect(parseStyle({ border: 2, color: "red" })).toEqual({ color: "red" });
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

describe("borda", () => {
  it("degraus em px inteiros e variáveis só quando escolhida", () => {
    expect(BORDER_PX).toEqual({ s: 1, m: 2, l: 3 });
    expect(styleVars({ border: "l" })).toEqual({
      "--borda": "3px",
      "--borda-destaque": "color-mix(in srgb,var(--marca) 55%,#000)",
    });
    expect(styleVars({ border: "none" })).toEqual({ "--borda": "0px" });
    expect(styleVars({ color: "red" })).not.toHaveProperty("--borda");
  });

  it("halo da seta: padrão de sempre, nenhum, ou a espessura mais a borda dos dois lados", () => {
    expect(arrowHalo(10, undefined)).toEqual({ shaft: 22, head: 12 });
    expect(arrowHalo(10, "none")).toBeNull();
    expect(arrowHalo(10, "s")).toEqual({ shaft: 12, head: 2 });
    expect(arrowHalo(10, "l")).toEqual({ shaft: 16, head: 6 });
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

describe("exportação com style", () => {
  let workspace: string;
  let n = 0;
  beforeEach(async () => {
    workspace = await mkdtemp(path.join(tmpdir(), "explicai-style-exp-"));
  });
  afterEach(async () => {
    await rm(workspace, { recursive: true, force: true });
  });

  // Um manual novo por chamada, igual em tudo menos no style.
  const out = async (style?: unknown) => {
    const { dir } = await createManual(workspace, { title: `M${++n}`, language: "pt-BR" });
    const asset = await saveAsset(dir, "tela.png", new Uint8Array([1, 2, 3]));
    await writeAnnotations(dir, asset, {
      ...base,
      ...(style === undefined ? {} : { style }),
      markers: [{ id: "m1", n: 1, x: 0.5, y: 0.5, label: "Botão" }],
      arrows: [{ id: "a1", from: { x: 0.1, y: 0.1 }, to: { x: 0.4, y: 0.4 } }],
    });
    await addPage(dir, { title: "P", body: `![Tela](../${asset})` });
    return readFile(path.join(dir, (await exportManual(dir, "html")).file), "utf8");
  };
  // Só o miolo da página: o resto muda com o id e a data de cada manual.
  const shot = (html: string) => /<span class="shot[\s\S]*?<\/span><\/span><\/span>/.exec(html)?.[0] ?? "";
  const arrowWidth = (html: string) => Number(/<line (?!class)[^>]*stroke-width="([\d.]+)"/.exec(html)?.[1]);

  it("sem style, ou com style que não vale nada, o HTML não carrega o estilo e é igual", async () => {
    const sem = await out();
    expect(sem).not.toMatch(/--disco|--marca-espessura|calc\(2px/);
    expect(sem).toContain('<span class="shot"><span class="frame"');
    expect(shot(await out({ color: "rosa" }))).toBe(shot(sem));
  });

  it("style vira variáveis no .shot (print e legenda herdam) e as regras que as usam", async () => {
    const html = await out({ color: "red", size: "l", stroke: "l" });
    const vars = /<span class="shot" style="([^"]*)">/.exec(html)?.[1] ?? "";
    expect(vars).toContain("--anotacao:#c4261d");
    expect(vars).toContain("--sobre-anotacao:#ffffff");
    expect(vars).toContain("--disco:32px");
    expect(vars).toContain("--marca-espessura:1.5");
    expect(html).toContain("calc(2px*var(--marca-espessura,1))");
  });

  it("border: sem o campo nada muda; com ele entram a regra e as variáveis; none tira o halo da seta", async () => {
    const sem = await out({ color: "red" });
    expect(sem).not.toContain("--borda");
    const l = await out({ border: "l" });
    expect(/<span class="shot" style="([^"]*)">/.exec(l)?.[1]).toContain("--borda:3px");
    expect(l).toContain("border-width:var(--borda");
    expect(l).toContain('class="halo"');
    expect(shot(await out({ border: "none" }))).not.toContain('class="halo"');
  });

  it("o degrau m é a espessura de sempre; s e l afinam e engrossam a seta", async () => {
    const [sem, s, m, l] = (await Promise.all([out(), out({ stroke: "s" }), out({ stroke: "m" }), out({ stroke: "l" })])).map(
      arrowWidth,
    );
    expect(m).toBe(sem);
    expect(s).toBeLessThan(m as number);
    expect(l).toBeGreaterThan(m as number);
  });
});
