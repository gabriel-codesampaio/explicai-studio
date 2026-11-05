import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addPage, checkManual, createManual, isStale, readPage, readPageTree, updatePage } from "../src/core/index.js";

let workspace: string;
let dir: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-reviewed-"));
  dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

describe("reviewed (conferida em)", () => {
  it("ausente: página sem a data e sem o campo no arquivo", async () => {
    const page = await addPage(dir, { title: "A", body: "Texto." });
    expect(page.reviewed).toBeUndefined();
    expect(await readFile(path.join(dir, page.file), "utf8")).not.toContain("reviewed");
  });

  it("presente: grava, lê, aparece na árvore e sobrevive a outra edição", async () => {
    const page = await addPage(dir, { title: "A" });
    await updatePage(dir, page.id, { reviewed: "2026-11-05" });
    expect(await readFile(path.join(dir, page.file), "utf8")).toContain("reviewed: 2026-11-05");
    await updatePage(dir, page.id, { body: "Novo." });
    expect((await readPage(dir, page.id)).reviewed).toBe("2026-11-05");
    expect((await readPageTree(dir))[0]?.reviewed).toBe("2026-11-05");
  });

  it("recusa data inválida na gravação", async () => {
    const page = await addPage(dir, { title: "A" });
    await expect(updatePage(dir, page.id, { reviewed: "ontem" })).rejects.toThrow(/reviewed/);
    await expect(updatePage(dir, page.id, { reviewed: "2026-02-31" })).rejects.toThrow(/reviewed/);
  });

  it("inválida no arquivo: não quebra, vale como sem data e volta intacta ao salvar", async () => {
    const page = await addPage(dir, { title: "A", body: "x" });
    const file = path.join(dir, page.file);
    const text = await readFile(file, "utf8");
    await writeFile(file, text.replace("---\n\n", "reviewed: semana passada\n---\n\n"));
    const read = await readPage(dir, page.id);
    expect(read.reviewed).toBeUndefined();
    expect((await readPageTree(dir))[0]?.problem).toBeUndefined();
    await updatePage(dir, page.id, { body: "y" });
    expect(await readFile(file, "utf8")).toContain("reviewed: semana passada");
  });

  it("isStale: sem data ou com mais de 90 dias", () => {
    const today = new Date("2026-11-05T12:00:00");
    expect(isStale(undefined, today)).toBe(true);
    expect(isStale("2026-08-07", today)).toBe(false); // 90 dias
    expect(isStale("2026-08-06", today)).toBe(true); // 91 dias
    expect(isStale("2026-11-05", today)).toBe(false);
  });

  it("checkManual: página sem conferência vira achado; conferida hoje não", async () => {
    const a = await addPage(dir, { title: "A" });
    const b = await addPage(dir, { title: "B" });
    const day = new Date();
    const today = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    await updatePage(dir, b.id, { reviewed: today });
    const found = (await checkManual(dir)).filter((f) => f.kind === "not-reviewed");
    expect(found.map((f) => f.pageId)).toEqual([a.id]);
  });
});
