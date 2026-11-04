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

  it("assets/*.json mantém campos novos na raiz e nas marcações", async () => {
    const file = path.join(dir, "assets", "tela.png.json");
    await writeFile(
      file,
      JSON.stringify({
        version: 1,
        futuro: { a: [1] },
        markers: [{ id: "m1", n: 1, x: 0.1, y: 0.1, cor: "azul" }],
        highlights: [],
        arrows: [],
        hotspots: [],
      }),
    );
    const read = await readAnnotations(dir, "assets/tela.png");
    await writeAnnotations(dir, "assets/tela.png", read); // caminho do Studio
    await appendAnnotations(dir, "assets/tela.png", { highlights: [{ x: 0, y: 0, w: 0.5, h: 0.5 }] }); // caminho do MCP

    const out = await json("assets/tela.png.json");
    expect(out.futuro).toEqual({ a: [1] });
    expect(out.markers[0].cor).toBe("azul");
    expect(out.highlights).toHaveLength(1);
  });
});
