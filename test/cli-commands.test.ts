import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isSubcommand, runSubcommand } from "../src/cli-commands.js";
import { addPage, createManual, ExplicaiError } from "../src/core/index.js";

async function run(args: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runSubcommand(args, { out: (s) => out.push(s), err: (s) => err.push(s) });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

async function manual(body: string) {
  const ws = await mkdtemp(path.join(tmpdir(), "expl-cli-"));
  const { dir } = await createManual(ws, { title: "M", language: "pt-BR" });
  await addPage(dir, { title: "P", body });
  return dir;
}

describe("subcomandos da CLI", () => {
  it("só check e export são subcomandos", () => {
    expect(isSubcommand("check")).toBe(true);
    expect(isSubcommand("export")).toBe(true);
    expect(isSubcommand("manuais")).toBe(false);
    expect(isSubcommand(undefined)).toBe(false);
  });

  it("check sai com 1 e lista o achado quando há link morto", async () => {
    const dir = await manual("[x](./nao-existe.md)");
    const r = await run(["check", dir]);
    expect(r.code).toBe(1);
    expect(r.out).toContain("nao-existe.md");
  });

  it("check sai com 0 sem achado", async () => {
    const dir = await manual("Texto simples.");
    const r = await run(["check", dir]);
    expect(r.code).toBe(0);
  });

  it("check sem pasta, com opção desconhecida ou pasta inexistente sai com 1", async () => {
    expect((await run(["check"])).code).toBe(1);
    expect((await run(["check", "a", "--json"])).code).toBe(1);
    expect((await run(["check", path.join(tmpdir(), "nao-existe-expl")])).code).toBe(1);
  });

  it("export md grava o arquivo e sai com 0", async () => {
    const dir = await manual("Texto.");
    const r = await run(["export", dir, "--format", "md"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("manual.md");
  });

  it("export html funciona", async () => {
    const dir = await manual("Texto.");
    expect((await run(["export", dir, "--format", "html"])).code).toBe(0);
  });

  it("export exige --format html|pdf|md", async () => {
    const dir = await manual("Texto.");
    const semFormato = await run(["export", dir]);
    expect(semFormato.code).toBe(1);
    expect(semFormato.err).toContain("--format");
    expect((await run(["export", dir, "--format", "docx"])).code).toBe(1);
  });

  it("export pdf sem navegador mostra a mensagem do núcleo e sai com 1", async () => {
    const dir = await manual("Texto.");
    const err: string[] = [];
    const code = await runSubcommand(["export", dir, "--format", "pdf"], {
      out: () => {},
      err: (s) => err.push(s),
      exportManual: async () => {
        throw new ExplicaiError("no-browser", "nenhum Chrome, Edge ou Chromium. Instale um deles.");
      },
    });
    expect(code).toBe(1);
    expect(err.join("\n")).toContain("Instale");
  });

  it("--help do subcomando sai com 0", async () => {
    const r = await run(["check", "--help"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("explicai check");
  });
});
