import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addAudience,
  addPage,
  createManual,
  readManual,
  readPage,
  removeAudience,
  removePage,
  renameAudience,
  updatePage,
} from "../src/core/index.js";

// Falha injetada: a gravação atômica de número `failAt` lança. 0 = sem falha.
const inject = vi.hoisted(() => ({ failAt: 0, calls: 0 }));
vi.mock("../src/core/fs.js", async (orig) => {
  const real = await orig<typeof import("../src/core/fs.js")>();
  return {
    ...real,
    atomicWrite: (...args: Parameters<typeof real.atomicWrite>) => {
      inject.calls++;
      if (inject.failAt && inject.calls === inject.failAt) throw new Error("falha injetada");
      return real.atomicWrite(...args);
    },
  };
});

let workspace: string;
let dir: string;

beforeEach(async () => {
  inject.failAt = 0;
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-aud-"));
  dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
});
afterEach(() => rm(workspace, { recursive: true, force: true }));

const audiences = async () => (await readManual(dir)).audiences;
const refused = { code: expect.stringMatching(/^audience-/) };

describe("addAudience", () => {
  it("guarda o nome limpo e recusa vazio, longo ou repetido sem gravar", async () => {
    expect(await addAudience(dir, "  Admin ")).toBe("Admin");
    for (const bad of ["   ", "x".repeat(41), "admin"]) {
      await expect(addAudience(dir, bad)).rejects.toMatchObject(refused);
    }
    expect(await audiences()).toEqual(["Admin"]);
  });
});

describe("renameAudience", () => {
  it("reescreve lista e páginas, inclusive na lixeira, e conta as páginas", async () => {
    await addAudience(dir, "admin");
    const a = await addPage(dir, { title: "A", audience: ["admin", "ops"] });
    const b = await addPage(dir, { title: "B", audience: ["admin"] });
    await addPage(dir, { title: "C", audience: ["ops"] });
    const { trashId } = await removePage(dir, b.id);
    expect(await renameAudience(dir, "admin", " Administrador ")).toEqual({ name: "Administrador", pages: 2 });
    expect(await audiences()).toEqual(["Administrador", "ops"]);
    expect((await readPage(dir, a.id)).audience).toEqual(["Administrador", "ops"]);
    const inTrash = await readFile(path.join(dir, ".lixeira", trashId, b.file), "utf8");
    expect(inTrash).toContain("Administrador");
    expect((await readdir(path.join(dir, ".lixeira"))).length).toBe(1);
  });

  it("ignora entrada da lixeira com caminho fora da pasta", async () => {
    await addAudience(dir, "admin");
    const b = await addPage(dir, { title: "B", audience: ["admin"] });
    const { trashId } = await removePage(dir, b.id);
    const entryPath = path.join(dir, ".lixeira", trashId, "entry.json");
    const entry = JSON.parse(await readFile(entryPath, "utf8"));
    entry.node.file = "../../fora.md";
    await writeFile(entryPath, JSON.stringify(entry));
    await writeFile(path.join(dir, "fora.md"), "---
audience: [admin]
---
x");
    await renameAudience(dir, "admin", "novo");
    expect(await readFile(path.join(dir, "fora.md"), "utf8")).toContain("admin");
  });

  it("recusa nome existente (sem maiúscula), vazio ou longo e não grava nada", async () => {
    await addAudience(dir, "admin");
    await addAudience(dir, "ops");
    const p = await addPage(dir, { title: "A", audience: ["admin"] });
    for (const bad of ["OPS", "", "x".repeat(41)]) {
      await expect(renameAudience(dir, "admin", bad)).rejects.toMatchObject(refused);
    }
    expect(await audiences()).toEqual(["admin", "ops"]);
    expect((await readPage(dir, p.id)).audience).toEqual(["admin"]);
  });

  it("aceita só trocar maiúscula e dá erro se o público não existe", async () => {
    await addAudience(dir, "admin");
    await renameAudience(dir, "admin", "Admin");
    expect(await audiences()).toEqual(["Admin"]);
    await expect(renameAudience(dir, "nada", "x")).rejects.toMatchObject({ code: "audience-not-found" });
  });

  it("página aberta no editor não regrava o nome antigo ao salvar só o corpo", async () => {
    await addAudience(dir, "admin");
    const p = await addPage(dir, { title: "A", audience: ["admin"] });
    await renameAudience(dir, "admin", "gestor");
    await updatePage(dir, p.id, { body: "texto novo" });
    expect((await readPage(dir, p.id)).audience).toEqual(["gestor"]);
    expect(await audiences()).toEqual(["gestor"]);
  });

  it("falha no meio: repetir termina o serviço", async () => {
    await addAudience(dir, "admin");
    const a = await addPage(dir, { title: "A", audience: ["admin"] });
    const b = await addPage(dir, { title: "B", audience: ["admin"] });
    inject.calls = 0;
    inject.failAt = 2; // A gravada, B falha
    await expect(renameAudience(dir, "admin", "gestor")).rejects.toThrow("falha injetada");
    expect(await audiences()).toEqual(["admin"]); // manual.json por último: ainda no estado antigo
    inject.failAt = 0;
    await renameAudience(dir, "admin", "gestor");
    expect(await audiences()).toEqual(["gestor"]);
    expect((await readPage(dir, a.id)).audience).toEqual(["gestor"]);
    expect((await readPage(dir, b.id)).audience).toEqual(["gestor"]);
  });
});

describe("removeAudience", () => {
  it("tira o nome; página só dele volta a todos e vem na resposta", async () => {
    await addAudience(dir, "admin");
    const solo = await addPage(dir, { title: "Só admin", audience: ["admin"] });
    const mix = await addPage(dir, { title: "Mista", audience: ["admin", "ops"] });
    expect(await removeAudience(dir, "admin")).toEqual({ freed: [{ id: solo.id, title: "Só admin" }] });
    expect(await audiences()).toEqual(["ops"]);
    expect((await readPage(dir, solo.id)).audience).toBeUndefined();
    expect((await readPage(dir, mix.id)).audience).toEqual(["ops"]);
    expect(await readFile(path.join(dir, solo.file), "utf8")).not.toContain("audience");
  });

  it("público sem página sai da lista; inexistente dá erro", async () => {
    await addAudience(dir, "vazio");
    expect(await removeAudience(dir, "vazio")).toEqual({ freed: [] });
    await expect(removeAudience(dir, "vazio")).rejects.toMatchObject({ code: "audience-not-found" });
  });

  it("falha no meio: repetir termina", async () => {
    await addAudience(dir, "admin");
    const a = await addPage(dir, { title: "A", audience: ["admin"] });
    const b = await addPage(dir, { title: "B", audience: ["admin"] });
    inject.calls = 0;
    inject.failAt = 2;
    await expect(removeAudience(dir, "admin")).rejects.toThrow("falha injetada");
    expect(await audiences()).toEqual(["admin"]);
    inject.failAt = 0;
    await removeAudience(dir, "admin");
    expect(await audiences()).toEqual([]);
    expect((await readPage(dir, a.id)).audience).toBeUndefined();
    expect((await readPage(dir, b.id)).audience).toBeUndefined();
  });
});
