import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addPage,
  createManual,
  listVersions,
  publishVersion,
  readManual,
  readPage,
  readVersion,
  removePage,
  restorePage,
  restoreVersion,
  saveVersion,
  updatePage,
  VERSIONS_DIR,
} from "../src/core/index.js";

let workspace: string;
let dir: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-versions-"));
  dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

describe("versões da página", () => {
  it("guarda cópias do texto e lista da mais recente para a mais antiga", async () => {
    const page = await addPage(dir, { title: "Cadastro", body: "primeiro" });
    const v1 = await saveVersion(dir, page.id, "  Revisado  ");
    await updatePage(dir, page.id, { body: "segundo" });
    const v2 = await saveVersion(dir, page.id);

    expect((await listVersions(dir, page.id)).map((v) => [v.id, v.note])).toEqual([
      [v2.id, ""],
      [v1.id, "Revisado"],
    ]);
    expect((await readVersion(dir, page.id, v1.id)).body).toBe("primeiro");
    expect(await readdir(path.join(dir, VERSIONS_DIR, page.id))).toHaveLength(2);
  });

  it("restaurar troca o texto e guarda o que estava antes, sem perder nada", async () => {
    const page = await addPage(dir, { title: "Cadastro", body: "antigo" });
    const v1 = await saveVersion(dir, page.id);
    await updatePage(dir, page.id, { title: "Cadastro novo", body: "novo" });

    const restored = await restoreVersion(dir, page.id, v1.id);
    expect(restored).toMatchObject({ title: "Cadastro", body: "antigo", file: "pages/cadastro.md" });
    const versions = await listVersions(dir, page.id);
    expect(versions[0]).toMatchObject({ note: "Antes de restaurar", title: "Cadastro novo" });
    expect((await readVersion(dir, page.id, versions[0]?.id ?? "")).body).toBe("novo");
  });

  it("marca a versão do manual final no manual.json e desmarca com null", async () => {
    const page = await addPage(dir, { title: "Cadastro" });
    const v1 = await saveVersion(dir, page.id);

    await publishVersion(dir, page.id, v1.id);
    expect((await readManual(dir)).pages[0]?.published).toBe(v1.id);
    expect((await listVersions(dir, page.id))[0]?.published).toBe(true);

    await publishVersion(dir, page.id, null);
    expect((await readManual(dir)).pages[0]).not.toHaveProperty("published");
  });

  it("recusa versão que não existe e caminho para fora da pasta", async () => {
    const page = await addPage(dir, { title: "Cadastro" });
    await expect(publishVersion(dir, page.id, "nao-existe")).rejects.toThrow(/Versão não encontrada/);
    await expect(readVersion(dir, page.id, "../../manual")).rejects.toThrow();
    await expect(saveVersion(dir, "../fora")).rejects.toThrow(/Página não encontrada/);
  });

  it("a página volta da lixeira com as versões e a versão escolhida", async () => {
    const page = await addPage(dir, { title: "Cadastro" });
    const v1 = await saveVersion(dir, page.id);
    await publishVersion(dir, page.id, v1.id);
    const { trashId } = await removePage(dir, page.id);
    await restorePage(dir, trashId);

    expect((await listVersions(dir, page.id))[0]).toMatchObject({ id: v1.id, published: true });
    expect((await readPage(dir, page.id)).title).toBe("Cadastro");
  });
});
