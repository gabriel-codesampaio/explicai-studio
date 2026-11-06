import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseItemStyle, resolveItemStyle } from "../src/core/annotationStyle.js";
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
const A = { x: 0.1, y: 0.1 };
const B = { x: 0.4, y: 0.4 };

describe("parseItemStyle", () => {
  it("cada tipo guarda só os campos dele", () => {
    const all = { color: "red", size: "l", stroke: "s", border: "m", fill: "soft" };
    expect(parseItemStyle("marker", all)).toEqual({ color: "red", size: "l", border: "m" });
    expect(parseItemStyle("arrow", all)).toEqual({ color: "red", stroke: "s", border: "m" });
    expect(parseItemStyle("highlight", all)).toEqual({ border: "m", fill: "soft" });
    expect(parseItemStyle("hotspot", all)).toEqual({ color: "red", border: "m", fill: "soft" });
  });

  it("inválido é ignorado campo a campo; vazio some", () => {
    expect(parseItemStyle("marker", { color: "rosa", size: "xl", border: "none" })).toEqual({ border: "none" });
    expect(parseItemStyle("marker", { color: "rosa" })).toBeUndefined();
    expect(parseItemStyle("hotspot", { fill: "cheio" })).toBeUndefined();
    for (const v of [null, "red", 3, [], undefined]) expect(parseItemStyle("arrow", v)).toBeUndefined();
  });

  it("fill e border ambos none: a borda volta a s", () => {
    expect(parseItemStyle("hotspot", { fill: "none", border: "none" })).toEqual({ fill: "none", border: "s" });
    expect(parseItemStyle("hotspot", { fill: "none", border: "l" })).toEqual({ fill: "none", border: "l" });
    expect(parseItemStyle("hotspot", { fill: "soft", border: "none" })).toEqual({ fill: "soft", border: "none" });
  });
});

describe("resolveItemStyle", () => {
  it("fill none com borda none herdada da imagem: a borda do item vira s", () => {
    expect(resolveItemStyle({ fill: "none" }, { border: "none" })).toEqual({ fill: "none", border: "s" });
    expect(resolveItemStyle({ fill: "none", border: "l" }, { border: "none" })).toEqual({ fill: "none", border: "l" });
    expect(resolveItemStyle({ fill: "soft" }, { border: "none" })).toEqual({ fill: "soft" });
    expect(resolveItemStyle(undefined, { border: "none" })).toBeUndefined();
  });

  it("no export a área sem preenchimento sobre imagem sem borda ganha --borda:1px", async () => {
    const ws = await mkdtemp(path.join(tmpdir(), "explicai-resolve-"));
    try {
      const { dir } = await createManual(ws, { title: "R", language: "pt-BR" });
      const asset = await saveAsset(dir, "tela.png", new Uint8Array([1, 2, 3]));
      await writeAnnotations(dir, asset, {
        ...base,
        style: { border: "none" },
        hotspots: [{ id: "t1", ...A, w: 0.2, h: 0.1, target: { type: "url", href: "https://a.com" }, style: { fill: "none" } }],
      });
      await addPage(dir, { title: "P", body: `![Tela](../${asset})` });
      const h = await readFile(path.join(dir, (await exportManual(dir, "html")).file), "utf8");
      expect(/class="hot"[^>]*style="[^"]*--borda:1px/.test(h)).toBe(true);
    } finally {
      await rm(ws, { recursive: true, force: true });
    }
  });
});

describe("parseAnnotations com style de item", () => {
  const input = {
    ...base,
    markers: [
      { id: "m1", n: 1, ...A, style: { color: "green", size: "s" } },
      { id: "m2", n: 2, ...B, style: { color: "x" } },
    ],
    highlights: [{ id: "h1", ...A, w: 0.2, h: 0.1, style: { border: "none" } }],
    arrows: [{ id: "a1", from: A, to: B, style: { stroke: "l" } }],
    hotspots: [
      { id: "t1", ...A, w: 0.2, h: 0.1, target: { type: "page", pageId: "p" }, style: { fill: "none", border: "none" } },
    ],
  };

  it("leva o style dos quatro tipos; inválido e vazio somem", () => {
    const out = parseAnnotations(input);
    expect(out.markers[0]?.style).toEqual({ color: "green", size: "s" });
    expect(out.markers[1]).not.toHaveProperty("style");
    expect(out.highlights[0]?.style).toEqual({ border: "none" });
    expect(out.arrows[0]?.style).toEqual({ stroke: "l" });
    expect(out.hotspots[0]?.style).toEqual({ fill: "none", border: "s" });
  });

  it("ler e gravar de novo não perde nada (idempotente)", () => {
    const once = parseAnnotations(input);
    expect(parseAnnotations(JSON.parse(JSON.stringify(once)))).toEqual(once);
  });
});

describe("gravar, acrescentar (annotate_image) e exportar", () => {
  let workspace: string;
  let n = 0;
  beforeEach(async () => {
    workspace = await mkdtemp(path.join(tmpdir(), "explicai-item-style-"));
  });
  afterEach(async () => {
    await rm(workspace, { recursive: true, force: true });
  });

  const html = async (items: Record<string, unknown>) => {
    const { dir } = await createManual(workspace, { title: `M${++n}`, language: "pt-BR" });
    const asset = await saveAsset(dir, "tela.png", new Uint8Array([1, 2, 3]));
    await writeAnnotations(dir, asset, { ...base, ...items });
    await addPage(dir, { title: "P", body: `![Tela](../${asset})` });
    return readFile(path.join(dir, (await exportManual(dir, "html")).file), "utf8");
  };
  const plain = {
    markers: [{ id: "m1", n: 1, ...B, label: "Botão" }],
    arrows: [{ id: "a1", from: A, to: B }],
    highlights: [{ id: "h1", ...A, w: 0.2, h: 0.1 }],
  };
  const shot = (h: string) => /<span class="shot[\s\S]*?<\/span><\/span><\/span>/.exec(h)?.[0] ?? "";

  it("regravar pelo caminho do MCP preserva o style dos itens", async () => {
    const { dir } = await createManual(workspace, { title: "MCP", language: "pt-BR" });
    const asset = "assets/tela.png";
    await writeAnnotations(dir, asset, { ...base, markers: [{ id: "m1", n: 1, ...A, style: { color: "red" } }] });
    await appendAnnotations(dir, asset, { markers: [{ ...B, label: "Novo" }] });
    const after = await readAnnotations(dir, asset);
    expect(after.version).toBe(1);
    expect(after.markers[0]?.style).toEqual({ color: "red" });
    expect(after.markers[1]).not.toHaveProperty("style");
  });

  it("appendAnnotations grava o style do patch por tipo e ignora o inválido", async () => {
    const { dir } = await createManual(workspace, { title: "MCP", language: "pt-BR" });
    const asset = "assets/tela.png";
    const r = { x: 0.1, y: 0.1, w: 0.2, h: 0.2 };
    const bad = { color: "rosa" } as never;
    await appendAnnotations(dir, asset, {
      markers: [
        { ...A, style: { color: "red", size: "l" } },
        { ...B, style: bad },
      ],
      highlights: [{ ...r, style: { color: "pink", fill: "soft", border: "none" } }],
      arrows: [{ from: A, to: B, style: { stroke: "l" } }],
      hotspots: [{ ...r, target: { type: "url", href: "https://a.b" }, style: { fill: "none", border: "none" } }],
    });
    const a = await readAnnotations(dir, asset);
    expect(a.markers[0]?.style).toEqual({ color: "red", size: "l" });
    expect(a.markers[1]).not.toHaveProperty("style");
    expect(a.highlights[0]?.style).toEqual({ color: "pink", fill: "soft", border: "none" });
    expect(a.arrows[0]?.style).toEqual({ stroke: "l" });
    expect(a.hotspots[0]?.style).toEqual({ fill: "none", border: "s" });
  });

  it("sem style de item o HTML é o mesmo de sempre (sem regra nova, sem variável)", async () => {
    const h = await html(plain);
    expect(h).not.toMatch(/--disco|--borda|--preenchimento|<g style/);
    expect(h).toContain('<span class="shot"><span class="frame"');
  });

  it("style do item vira variáveis no próprio elemento; os outros herdam da imagem", async () => {
    const h = await html({
      style: { color: "ink" },
      markers: [
        { ...plain.markers[0], style: { color: "red", size: "l", border: "l" } },
        { id: "m2", n: 2, ...A, label: "Outro" },
      ],
      arrows: [{ ...plain.arrows[0], style: { color: "green", stroke: "l", border: "none" } }],
      highlights: [{ ...plain.highlights[0], style: { border: "l" } }],
      hotspots: [
        {
          id: "t1",
          ...A,
          w: 0.2,
          h: 0.1,
          target: { type: "url", href: "https://a.com" },
          style: { color: "purple", fill: "solid" },
        },
      ],
    });
    const s = shot(h);
    expect(s).toContain('class="mk" style="left:40.000%;top:40.000%;--anotacao:#c4261d');
    expect(s).toContain("--disco:32px;--disco-fonte:16px;--borda:3px");
    expect(s).toMatch(/<span class="mk" style="left:10\.000%;top:10\.000%" /); // m2 não tem override
    expect(s).toContain(
      '<g style="--anotacao:#1a7a3c;--sobre-anotacao:#ffffff;--anotacao-fundo:rgba(26,122,60,0.08);--marca-espessura:1.5;--borda:0px">',
    );
    expect(s).toMatch(/class="hl" style="[^"]*--borda:3px;--borda-destaque/);
    expect(s).toMatch(
      /class="hot" href="[^"]*" style="[^"]*--anotacao:#7b3fc4[^"]*--preenchimento:color-mix\(in srgb,var\(--anotacao\) 25%/,
    );
    expect(h).toContain('<span class="row" role="listitem" style="--anotacao:#c4261d'); // chip da legenda
    expect(h).toContain("var(--preenchimento,var(--anotacao-fundo))");
    expect(h).toContain("border-width:var(--borda"); // regra da borda entra só por causa do item
    // seta com border none: sem halo
    expect(s).not.toContain('class="halo"');
  });
});
