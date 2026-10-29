import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addPage, createManual, exportManual, readPage, readPageTree, updatePage } from "../src/core/index.js";

let workspace: string;
let dir: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-status-"));
  dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

describe("fluxo de aprovação", () => {
  it("página nasce rascunho, sem status no arquivo; o status escolhido vai para o frontmatter", async () => {
    const page = await addPage(dir, { title: "Cadastro", body: "Texto." });
    expect(page.status).toBe("rascunho");
    expect(await readFile(path.join(dir, page.file), "utf8")).not.toContain("status");

    await updatePage(dir, page.id, { status: "revisao" });
    expect(await readFile(path.join(dir, page.file), "utf8")).toContain("status: revisao");
    expect((await readPage(dir, page.id)).status).toBe("revisao");
    expect((await readPageTree(dir))[0]?.status).toBe("revisao");

    // biome-ignore lint/suspicious/noExplicitAny: status vindo de fora (API, arquivo editado à mão)
    await expect(updatePage(dir, page.id, { status: "pronto" as any })).rejects.toThrow(/Status inválido/);
  });

  it("exportar só aprovadas: subpágina aprovada sobe para o lugar da mãe em rascunho, sem buraco na numeração", async () => {
    const a = await addPage(dir, { title: "A" });
    const b = await addPage(dir, { title: "B" });
    const b1 = await addPage(dir, { title: "B1", parentId: b.id });
    const c = await addPage(dir, { title: "C" });
    await updatePage(dir, a.id, { status: "aprovado" });
    await updatePage(dir, b1.id, { status: "publicado" });
    await updatePage(dir, c.id, { status: "aprovado" });

    const md = await readFile(path.join(dir, (await exportManual(dir, "markdown", { onlyApproved: true })).file), "utf8");
    expect(md).toContain("- [1 A](#1-a)\n- [2 B1](#2-b1)\n- [3 C](#3-c)");
    expect(md).not.toContain("B\n");

    const all = await readFile(path.join(dir, (await exportManual(dir, "markdown")).file), "utf8");
    expect(all).toContain("- [2 B](#2-b)\n  - [2.1 B1](#2-1-b1)\n- [3 C](#3-c)");
  });
});
