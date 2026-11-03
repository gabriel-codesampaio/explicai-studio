import { mkdtemp, readdir, readFile, rm, stat, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  cleanUnusedAssets,
  createManual,
  parseAnnotations,
  readAnnotations,
  saveAsset,
  writeAnnotations,
} from "../src/core/index.js";

let workspace: string;
let dir: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-display-"));
  dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

const png = new Uint8Array([137, 80, 78, 71]);
const base = { version: 1, markers: [], highlights: [], arrows: [], hotspots: [] };

describe("tamanho de exibição (display)", () => {
  it.each(["s", "m", "full"])("preserva display %s ao ler e regravar", async (display) => {
    expect(parseAnnotations({ ...base, display }).display).toBe(display);
    const asset = await saveAsset(dir, "tela.png", png);
    await writeAnnotations(dir, asset, { ...base, display });
    expect((await readAnnotations(dir, asset)).display).toBe(display);
  });

  it("ignora valor fora de s, m e full, e arquivo sem o campo segue sem ele", () => {
    expect(parseAnnotations({ ...base, display: "grande" })).not.toHaveProperty("display");
    expect(parseAnnotations({ ...base, display: 40 })).not.toHaveProperty("display");
    expect(parseAnnotations(base)).not.toHaveProperty("display");
  });

  it("cria o JSON só com display quando não existia, com version 1", async () => {
    const asset = await saveAsset(dir, "tela.png", png);
    await writeAnnotations(dir, asset, { version: 1, display: "s" });
    const saved = JSON.parse(await readFile(path.join(dir, `${asset}.json`), "utf8"));
    expect(saved).toMatchObject({ version: 1, display: "s", markers: [] });
  });

  it("abrir não regrava o arquivo", async () => {
    const asset = await saveAsset(dir, "tela.png", png);
    const file = path.join(dir, `${asset}.json`);
    const antigo = JSON.stringify({ ...base, display: "m" });
    await writeFile(file, antigo);
    const old = new Date(Date.now() - 120_000);
    await utimes(file, old, old);
    await readAnnotations(dir, asset);
    expect(await readFile(file, "utf8")).toBe(antigo);
    expect(Math.round((await stat(file)).mtimeMs)).toBe(old.getTime()); // mtimeMs tem fração de ponto flutuante no Linux
  });

  it("lixeira leva o JSON com display junto da imagem sem uso", async () => {
    const asset = await saveAsset(dir, "tela.png", png);
    await writeAnnotations(dir, asset, { version: 1, display: "full" });
    for (const f of await readdir(path.join(dir, "assets"))) {
      const old = new Date(Date.now() - 120_000);
      await utimes(path.join(dir, "assets", f), old, old);
    }
    const { moved, folder } = await cleanUnusedAssets(dir);
    expect(moved).toBe(2);
    const json = path.join(dir, folder ?? "", `${asset}.json`);
    expect(JSON.parse(await readFile(json, "utf8")).display).toBe("full");
  });
});
