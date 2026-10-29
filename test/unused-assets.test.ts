import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
import {
  addPage,
  cleanUnusedAssets,
  createManual,
  findUnusedAssets,
  removePage,
  saveAsset,
  saveVersion,
  updatePage,
  writeAnnotations,
} from "../src/core/index.js";

let workspace: string;
let dir: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-unused-"));
  dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

const png = new Uint8Array([137, 80, 78, 71]);
const marks = { version: 1, markers: [], highlights: [], arrows: [], hotspots: [] };

it("imagem citada por página, versão ou lixeira fica; a sem uso e a marcação sem imagem vão para a lixeira", async () => {
  const naPagina = await saveAsset(dir, "na-pagina.png", png);
  const naVersao = await saveAsset(dir, "na-versao.png", png);
  const naLixeira = await saveAsset(dir, "na-lixeira.png", png);
  const semUso = await saveAsset(dir, "sem-uso.png", png);
  await writeAnnotations(dir, semUso, marks);
  await writeFile(path.join(dir, "assets", "apagada.png.json"), JSON.stringify(marks));

  await addPage(dir, { title: "A", body: `![](../${naPagina})` });
  const b = await addPage(dir, { title: "B", body: `![](../${naVersao})` });
  await saveVersion(dir, b.id);
  await updatePage(dir, b.id, { body: "sem imagem agora" });
  const c = await addPage(dir, { title: "C", body: `![](../${naLixeira})` });
  await removePage(dir, c.id);

  expect((await findUnusedAssets(dir)).sort()).toEqual([
    "assets/apagada.png.json",
    "assets/sem-uso.png",
    "assets/sem-uso.png.json",
  ]);

  const { moved, folder } = await cleanUnusedAssets(dir);
  expect(moved).toBe(3);
  expect((await readdir(path.join(dir, "assets"))).sort()).toEqual(["na-lixeira.png", "na-pagina.png", "na-versao.png"]);
  expect((await readdir(path.join(dir, folder ?? "", "assets"))).sort()).toEqual([
    "apagada.png.json",
    "sem-uso.png",
    "sem-uso.png.json",
  ]);
  expect(await findUnusedAssets(dir)).toEqual([]);
});
