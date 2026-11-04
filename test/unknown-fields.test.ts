import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addPage,
  appendAnnotations,
  createManual,
  movePage,
  readAnnotations,
  renameManual,
  setManualTheme,
  updatePage,
  writeAnnotations,
} from "../src/core/index.js";

let workspace: string;
let dir: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-unk-"));
  dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
});
afterEach(() => rm(workspace, { recursive: true, force: true }));

const json = async (rel: string) => JSON.parse(await readFile(path.join(dir, rel), "utf8"));

describe("campo desconhecido: ida e volta", () => {
  it("manual.json mantém campos novos na raiz, no theme e nos nós da árvore", async () => {
    const a = await addPage(dir, { title: "A" });
    const b = await addPage(dir, { title: "B" });
    const meta = await json("manual.json");
    meta.futuro = { x: 1 };
    meta.pages[0].nota = "no";
    meta.theme = { accent: "#2b4fe0", novo: true };
    await writeFile(path.join(dir, "manual.json"), JSON.stringify(meta));

    await updatePage(dir, a.id, { title: "A2" });
    await movePage(dir, b.id, { parentId: a.id, index: 0 });
    await renameManual(dir, "M2");
    await setManualTheme(dir, { text: "#151a33" });

    const out = await json("manual.json");
    expect(out.futuro).toEqual({ x: 1 });
    expect(out.pages[0].nota).toBe("no");
    expect(out.pages[0].children[0].id).toBe(b.id);
    expect(out.theme.novo).toBe(true);
  });

  it("assets/*.json mantém campos novos na raiz e em marcador, destaque, seta e área clicável", async () => {
    const png = Buffer.alloc(33);
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png, 0);
    await writeFile(path.join(dir, "assets", "tela.png"), png);
    const file = path.join(dir, "assets", "tela.png.json");
    await writeFile(
      file,
      JSON.stringify({
        version: 1,
        futuro: { a: [1] },
        markers: [{ id: "m1", n: 1, x: 0.1, y: 0.1, nota: "m" }],
        highlights: [{ id: "h1", x: 0.1, y: 0.1, w: 0.2, h: 0.2, nota: "h" }],
        arrows: [{ id: "a1", from: { x: 0, y: 0 }, to: { x: 0.5, y: 0.5 }, nota: "a" }],
        hotspots: [{ id: "s1", x: 0.1, y: 0.1, w: 0.2, h: 0.2, target: { type: "url", href: "https://x.dev" }, nota: "s" }],
      }),
    );
    const read = await readAnnotations(dir, "assets/tela.png");
    await writeAnnotations(dir, "assets/tela.png", read); // caminho do Studio
    await appendAnnotations(dir, "assets/tela.png", { highlights: [{ x: 0, y: 0, w: 0.5, h: 0.5 }] }); // caminho do MCP

    const out = await json("assets/tela.png.json");
    expect(out.futuro).toEqual({ a: [1] });
    expect(out.markers[0].nota).toBe("m");
    expect(out.highlights[0].nota).toBe("h");
    expect(out.arrows[0].nota).toBe("a");
    expect(out.hotspots[0].nota).toBe("s");
    expect(out.highlights).toHaveLength(2);
  });

  it("style inválido de item não passa como campo desconhecido", async () => {
    const out = await writeAnnotations(dir, "assets/tela.png", {
      version: 1,
      markers: [{ id: "m1", n: 1, x: 0.1, y: 0.1, style: { color: "magenta", size: "xl" } }],
      highlights: [{ id: "h1", x: 0.1, y: 0.1, w: 0.2, h: 0.2, style: "vermelho" }],
      arrows: [{ id: "a1", from: { x: 0, y: 0 }, to: { x: 0.5, y: 0.5 }, style: { stroke: 9 } }],
      hotspots: [{ id: "s1", x: 0.1, y: 0.1, w: 0.2, h: 0.2, target: { type: "url", href: "https://x.dev" }, style: [] }],
    });
    const raw = JSON.stringify(out);
    expect(raw).not.toContain("magenta");
    expect(raw).not.toContain("vermelho");
    for (const item of [...out.markers, ...out.highlights, ...out.arrows, ...out.hotspots])
      expect(item).not.toHaveProperty("style");
  });
});
