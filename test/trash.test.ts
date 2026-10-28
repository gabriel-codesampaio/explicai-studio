import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addPage, createManual, flatten, readManual, readPage, removePage, restorePage, updatePage } from "../src/core/index.js";

let workspace: string;
let dir: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-trash-"));
  dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

const order = async () => flatten((await readManual(dir)).pages).map((n) => n.id);

describe("lixeira", () => {
  it("exclui e desfaz devolvendo a página, as subpáginas e o conteúdo ao mesmo lugar", async () => {
    const a = await addPage(dir, { title: "A" });
    const b = await addPage(dir, { title: "B", body: "texto de B" });
    const b1 = await addPage(dir, { title: "B1", parentId: b.id });
    const c = await addPage(dir, { title: "C" });

    const { trashId } = await removePage(dir, b.id);
    expect(await order()).toEqual([a.id, c.id]);
    await expect(readFile(path.join(dir, b.file), "utf8")).rejects.toThrow();

    await restorePage(dir, trashId);
    expect(await order()).toEqual([a.id, b.id, b1.id, c.id]);
    expect((await readPage(dir, b.id)).body).toBe("texto de B");
  });

  it("volta para a raiz quando o pai também foi excluído", async () => {
    const pai = await addPage(dir, { title: "Pai" });
    const filho = await addPage(dir, { title: "Filho", parentId: pai.id });
    const { trashId } = await removePage(dir, filho.id);
    await removePage(dir, pai.id);

    await restorePage(dir, trashId);
    expect((await readManual(dir)).pages.map((n) => n.id)).toEqual([filho.id]);
  });

  it("dá outro nome quando o arquivo foi ocupado enquanto a página estava na lixeira", async () => {
    const velha = await addPage(dir, { title: "Clientes" });
    const { trashId } = await removePage(dir, velha.id);
    const nova = await addPage(dir, { title: "Clientes" });
    expect(nova.file).toBe(velha.file);

    await restorePage(dir, trashId);
    expect((await readPage(dir, velha.id)).file).toBe("pages/clientes-2.md");
    expect((await readPage(dir, nova.id)).file).toBe("pages/clientes.md");
  });

  it("recusa id de lixeira que tenta sair da pasta", async () => {
    await expect(restorePage(dir, "../../fora")).rejects.toThrow(/fora do manual/);
  });
});

describe("página sem título", () => {
  it("aceita título vazio e grava como sem-titulo.md", async () => {
    const page = await addPage(dir, { title: "" });
    expect(page.file).toBe("pages/sem-titulo.md");
    expect((await updatePage(dir, page.id, { title: "Clientes" })).file).toBe("pages/clientes.md");
    expect((await updatePage(dir, page.id, { title: "  " })).title).toBe("");
  });
});
