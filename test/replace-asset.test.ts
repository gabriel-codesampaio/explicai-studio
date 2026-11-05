import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addPage,
  createManual,
  findUnusedAssets,
  readAnnotations,
  replaceAsset,
  restoreReplacedAsset,
  saveAsset,
  updatePage,
  writeAnnotations,
} from "../src/core/index.js";

let workspace: string;
let dir: string;
beforeEach(async () => {
  process.env.EXPLICAI_ASSET_GRACE_MS = "0";
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-replace-"));
  dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
});
afterEach(async () => {
  delete process.env.EXPLICAI_ASSET_GRACE_MS;
  await rm(workspace, { recursive: true, force: true });
});

/** Cabeçalho mínimo de PNG: o suficiente para ler largura e altura. */
const png = (w: number, h: number, tag = 0) => {
  const b = Buffer.alloc(33, tag);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13]).copy(b, 0);
  b.write("IHDR", 12, "ascii");
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(h, 20);
  return b;
};
const trashed = async (name: string) => {
  const folders = (await readdir(path.join(dir, ".lixeira"))).filter((f) => f.startsWith("imagens-"));
  return Promise.all(folders.map((f) => readFile(path.join(dir, ".lixeira", f, "assets", name)).catch(() => null)));
};

async function withMarkedImage() {
  const asset = await saveAsset(dir, "tela.png", png(1000, 500, 1));
  await writeAnnotations(dir, asset, {
    version: 1,
    markers: [{ id: "m1", n: 1, x: 0.25, y: 0.75 }],
    highlights: [{ id: "h1", x: 0.1, y: 0.2, w: 0.3, h: 0.4 }],
    arrows: [],
    hotspots: [],
  });
  const page = await addPage(dir, { title: "P" });
  await updatePage(dir, page.id, { body: `![tela](../${asset})\n` });
  return asset;
}

describe("trocar o arquivo de uma imagem", () => {
  it("grava o print novo no mesmo caminho e mantém as marcações em coordenadas relativas", async () => {
    const asset = await withMarkedImage();
    const before = await readAnnotations(dir, asset);
    await replaceAsset(dir, asset, "novo.png", png(2000, 1000, 2));
    expect(await readFile(path.join(dir, asset))).toEqual(png(2000, 1000, 2));
    const after = await readAnnotations(dir, asset);
    expect(after).toEqual(before);
    // 0,25 de 1000 px e 0,25 de 2000 px: o mesmo lugar relativo no print novo
    expect(after.markers[0]?.x).toBe(0.25);
    expect(after.markers[0]?.y).toBe(0.75);
  });

  it("manda o arquivo antigo para a lixeira, com os bytes de antes", async () => {
    const asset = await withMarkedImage();
    const { folder } = await replaceAsset(dir, asset, "novo.png", png(1000, 500, 2));
    expect(folder).toMatch(/^\.lixeira\/imagens-/);
    expect(await trashed("tela.png")).toContainEqual(png(1000, 500, 1));
  });

  it("não deixa imagem sem uso: a imagem e o .json seguem citados, a cópia da lixeira fica fora", async () => {
    const asset = await withMarkedImage();
    await replaceAsset(dir, asset, "novo.png", png(1000, 500, 2));
    expect(await findUnusedAssets(dir)).toEqual([]);
    expect((await readdir(path.join(dir, "assets"))).sort()).toEqual(["tela.png", "tela.png.json"]);
  });

  it("recusa extensão diferente da imagem atual e não mexe em nada", async () => {
    const asset = await withMarkedImage();
    await expect(replaceAsset(dir, asset, "novo.jpg", png(1000, 500, 2))).rejects.toThrow(/mesmo formato/);
    expect(await readFile(path.join(dir, asset))).toEqual(png(1000, 500, 1));
  });

  it("recusa arquivo que não abre como imagem", async () => {
    const asset = await withMarkedImage();
    await expect(replaceAsset(dir, asset, "novo.png", Buffer.from("não é imagem"))).rejects.toThrow(/não pôde ser lida/);
    expect(await readFile(path.join(dir, asset))).toEqual(png(1000, 500, 1));
    expect((await readdir(path.join(dir, "assets"))).sort()).toEqual(["tela.png", "tela.png.json"]);
  });

  it("recusa imagem que não existe", async () => {
    await expect(replaceAsset(dir, "assets/nada.png", "n.png", png(1, 1))).rejects.toThrow(/não existe/);
  });

  it("restaura o arquivo antigo e guarda o que estava no lugar", async () => {
    const asset = await withMarkedImage();
    const { folder } = await replaceAsset(dir, asset, "novo.png", png(1000, 500, 2));
    await restoreReplacedAsset(dir, asset, folder);
    expect(await readFile(path.join(dir, asset))).toEqual(png(1000, 500, 1));
    expect(await trashed("tela.png")).toContainEqual(png(1000, 500, 2));
    expect((await readAnnotations(dir, asset)).markers).toHaveLength(1);
  });

  it("restaurar recusa pasta fora da lixeira de imagens", async () => {
    const asset = await withMarkedImage();
    await writeFile(path.join(dir, "x.png"), png(1, 1));
    await expect(restoreReplacedAsset(dir, asset, "../..")).rejects.toThrow();
  });
});
