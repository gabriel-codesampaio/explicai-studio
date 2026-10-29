import { mkdtemp, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addPage, createManual, listManuals, readManual, readPage, readPageTree } from "../src/core/index.js";

/** O manual é uma pasta comum: alguém pode apagar ou estragar arquivos fora do Studio (à mão, num merge). */
let workspace: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-robust-"));
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

describe("pasta do manual mexida fora do Studio", () => {
  it("um manual.json corrompido não impede de listar os outros manuais", async () => {
    await createManual(workspace, { title: "Bom", language: "pt-BR" });
    const ruim = await createManual(workspace, { title: "Ruim", language: "pt-BR" });
    await writeFile(path.join(ruim.dir, "manual.json"), "{ quebrado");

    expect((await listManuals(workspace)).map((m) => m.meta.title)).toEqual(["Bom"]);
    await expect(readManual(ruim.dir)).rejects.toThrow(/manual.json do manual "ruim" não é um JSON válido/);
  });

  it("página apagada ou com cabeçalho quebrado aparece com aviso, e o resto da árvore continua", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const apagada = await addPage(dir, { title: "Apagada" });
    const boa = await addPage(dir, { title: "Boa" });
    const quebrada = await addPage(dir, { title: "Quebrada" });
    await unlink(path.join(dir, apagada.file));
    await writeFile(path.join(dir, quebrada.file), "---\ntitle: [sem fechar\n---\ntexto");

    const tree = await readPageTree(dir);
    expect(tree.map((n) => [n.title, Boolean(n.problem)])).toEqual([
      ["", true],
      ["Boa", false],
      ["", true],
    ]);
    expect(tree[0]?.problem).toMatch(/pages\/apagada.md não foi encontrado/);
    expect(tree[2]?.problem).toMatch(/cabeçalho \(frontmatter\) de pages\/quebrada.md tem um erro/);

    expect((await readPage(dir, boa.id)).title).toBe("Boa");
    await expect(readPage(dir, apagada.id)).rejects.toThrow(/apagado ou renomeado fora do Studio/);
  });

  it("página escrita à mão sem frontmatter abre com título vazio", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const page = await addPage(dir, { title: "Antes" });
    await writeFile(path.join(dir, page.file), "# Escrito à mão\n\nSem cabeçalho.");
    expect(await readPage(dir, page.id)).toMatchObject({ title: "", body: "# Escrito à mão\n\nSem cabeçalho." });
  });
});
