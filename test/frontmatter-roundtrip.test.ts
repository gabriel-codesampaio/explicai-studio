import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { splitFrontmatter } from "../src/core/frontmatter.js";
import { addPage, checkManual, createManual, readPage, updatePage } from "../src/core/index.js";

let workspace: string;
let dir: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-fm-"));
  dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
});
afterEach(() => rm(workspace, { recursive: true, force: true }));

describe("frontmatter: ida e volta", () => {
  it("preserva campos desconhecidos ao salvar, inclusive ao renomear", async () => {
    const page = await addPage(dir, { title: "Antes", body: "texto" });
    const file = path.join(dir, page.file);
    const raw = await readFile(file, "utf8");
    await writeFile(file, raw.replace("---\n\n", "sources:\n  - src/a.ts\n  - src/b.ts\nowner: { team: docs }\n---\n\n"));

    await updatePage(dir, page.id, { body: "novo" });
    await updatePage(dir, page.id, { title: "Depois" }); // renomeia o arquivo
    const back = await readPage(dir, page.id);

    expect(back.extra).toEqual({ sources: ["src/a.ts", "src/b.ts"], owner: { team: "docs" } });
    const saved = splitFrontmatter(await readFile(path.join(dir, back.file), "utf8"));
    expect(saved.data).toMatchObject({ id: page.id, title: "Depois", sources: ["src/a.ts", "src/b.ts"] });
    expect(saved.body).toBe("novo");
  });

  it("manual antigo com reviewed: lê, não acusa e preserva o campo como desconhecido", async () => {
    const page = await addPage(dir, { title: "Velha", body: "texto" });
    const file = path.join(dir, page.file);
    await writeFile(file, (await readFile(file, "utf8")).replace("---\n\n", "reviewed: 2026-11-05\n---\n\n"));

    await updatePage(dir, page.id, { body: "novo" });

    expect((await readPage(dir, page.id)).extra).toEqual({ reviewed: "2026-11-05" });
    expect(splitFrontmatter(await readFile(path.join(dir, page.file), "utf8")).data).toMatchObject({ reviewed: "2026-11-05" });
    expect((await checkManual(dir)).map((f) => f.kind)).toEqual([]);
  });

  it("grava e lê audience; vazio ou null apaga o campo", async () => {
    const page = await addPage(dir, { title: "P" });
    await updatePage(dir, page.id, { audience: [" admin ", "admin", "operador"] });
    expect((await readPage(dir, page.id)).audience).toEqual(["admin", "operador"]);
    expect(await readFile(path.join(dir, page.file), "utf8")).toContain("audience:");
    await updatePage(dir, page.id, { audience: null });
    expect((await readPage(dir, page.id)).audience).toBeUndefined();
    expect(await readFile(path.join(dir, page.file), "utf8")).not.toContain("audience");
  });

  it("aceita audience escrita à mão como texto solto", async () => {
    const page = await addPage(dir, { title: "P" });
    const file = path.join(dir, page.file);
    await writeFile(file, (await readFile(file, "utf8")).replace("---\n\n", "audience: admin\n---\n\n"));
    expect((await readPage(dir, page.id)).audience).toEqual(["admin"]);
  });
});
