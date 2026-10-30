import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { atomicWrite, exists, relativePosix, resolveInside, uniquePath } from "../src/core/fs.js";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "explicai-fs-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("atomicWrite", () => {
  it("grava o conteúdo e não deixa arquivo temporário", async () => {
    const file = path.join(dir, "a.md");
    await atomicWrite(file, "um");
    await atomicWrite(file, "dois");
    expect(await readFile(file, "utf8")).toBe("dois");
    expect(await readdir(dir)).toEqual(["a.md"]);
  });

  it("falha sem criar nada quando a pasta não existe", async () => {
    await expect(atomicWrite(path.join(dir, "falta", "a.md"), "x")).rejects.toThrow();
    expect(await readdir(dir)).toEqual([]);
  });

  it("grava em nomes reservados do Windows como arquivo comum", async () => {
    for (const name of ["CON.md", "nul.md", "COM1.png", "aux", "LPT9.txt"]) {
      const file = resolveInside(dir, name);
      await atomicWrite(file, name);
      expect(await readFile(file, "utf8")).toBe(name);
    }
  });
});

describe("resolveInside", () => {
  it("aceita caminhos dentro da pasta, inclusive a própria pasta", () => {
    expect(resolveInside(dir, "pages/a.md")).toBe(path.join(dir, "pages", "a.md"));
    expect(resolveInside(dir, "pages/../assets/a.png")).toBe(path.join(dir, "assets", "a.png"));
    expect(resolveInside(dir, ".")).toBe(path.resolve(dir));
  });

  it("recusa .. que sai da pasta", () => {
    for (const bad of ["..", "../x", "pages/../../x", "a/../../../etc/passwd"]) {
      expect(() => resolveInside(dir, bad), bad).toThrow(/fora do manual/);
    }
  });

  it("recusa caminho absoluto fora da pasta e aceita absoluto dentro dela", () => {
    const outside = path.resolve(dir, "..", "outro", "x.md");
    expect(() => resolveInside(dir, outside)).toThrow(/fora do manual/);
    expect(resolveInside(dir, path.join(dir, "ok.md"))).toBe(path.join(dir, "ok.md"));
  });

  it("recusa pasta irmã com o mesmo prefixo", () => {
    expect(() => resolveInside(dir, `../${path.basename(dir)}-irmao/x`)).toThrow(/fora do manual/);
  });

  it("recusa barra invertida que sai da pasta (no Windows ela separa pastas)", () => {
    if (path.sep !== "\\") return; // no POSIX `\` é um caractere de nome, não separador
    expect(() => resolveInside(dir, "..\\x")).toThrow(/fora do manual/);
    expect(() => resolveInside(dir, "pages\\..\\..\\x")).toThrow(/fora do manual/);
  });

  it("recusa letra de unidade diferente no Windows", () => {
    if (path.sep !== "\\") return;
    expect(() => resolveInside(dir, "Z:\\x")).toThrow(/fora do manual/);
    expect(() => resolveInside(dir, "\\\\servidor\\share\\x")).toThrow(/fora do manual/);
  });

  it("não decodifica %2f nem %2e: `..%2f` é um nome de arquivo comum, que fica dentro", () => {
    const abs = resolveInside(dir, "..%2fx");
    expect(path.dirname(abs)).toBe(path.resolve(dir));
    expect(resolveInside(dir, "%2e%2e/x")).toBe(path.join(dir, "%2e%2e", "x"));
  });

  it("nomes reservados do Windows ficam dentro da pasta", () => {
    for (const name of ["CON", "NUL", "COM1", "aux.md", "LPT1.png", "prn"]) {
      expect(resolveInside(dir, `assets/${name}`)).toBe(path.join(dir, "assets", name));
    }
  });
});

describe("uniquePath", () => {
  it("devolve base.ext quando livre e numera quando ocupado", async () => {
    expect(await uniquePath(dir, "tela", ".png")).toBe(path.join(dir, "tela.png"));
    await writeFile(path.join(dir, "tela.png"), "");
    expect(await uniquePath(dir, "tela", ".png")).toBe(path.join(dir, "tela-2.png"));
    await writeFile(path.join(dir, "tela-2.png"), "");
    expect(await uniquePath(dir, "tela", ".png")).toBe(path.join(dir, "tela-3.png"));
  });

  it("usa o nome sem número quando só o número seguinte está ocupado", async () => {
    await writeFile(path.join(dir, "x-2.md"), "");
    expect(await uniquePath(dir, "x", ".md")).toBe(path.join(dir, "x.md"));
  });

  it("trata nome reservado do Windows como qualquer outro", async () => {
    expect(await uniquePath(dir, "con", ".md")).toBe(path.join(dir, "con.md"));
    await writeFile(path.join(dir, "con.md"), "");
    expect(await uniquePath(dir, "con", ".md")).toBe(path.join(dir, "con-2.md"));
  });
});

describe("exists e relativePosix", () => {
  it("exists distingue o que há do que não há", async () => {
    expect(await exists(dir)).toBe(true);
    expect(await exists(path.join(dir, "nada"))).toBe(false);
  });

  it("relativePosix usa / em qualquer sistema", () => {
    expect(relativePosix(dir, path.join(dir, "pages", "a.md"))).toBe("pages/a.md");
  });
});
