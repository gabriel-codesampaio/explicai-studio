import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addPage, createManual, exportManual, findBrowser } from "../src/core/index.js";
import { createStudioServer } from "../src/server/index.js";

/** Nenhum Chrome de verdade roda aqui: `execFile` é trocado por um navegador de mentira que só grava o PDF. */
const fake = vi.hoisted(() => ({
  calls: [] as { file: string; args: string[] }[],
  fail: null as Error | null,
  write: true,
}));

vi.mock("node:child_process", async (importOriginal) => {
  const real = await importOriginal<typeof import("node:child_process")>();
  const { writeFileSync } = await import("node:fs");
  const execFile = Object.assign(() => undefined, {
    [promisify.custom]: async (file: string, args: string[]) => {
      fake.calls.push({ file, args });
      if (fake.fail) throw fake.fail;
      const out = args.find((a) => a.startsWith("--print-to-pdf="))?.slice("--print-to-pdf=".length);
      if (out && fake.write) writeFileSync(out, "%PDF-1.4 falso");
      return { stdout: "", stderr: "" };
    },
  });
  return { ...real, execFile };
});

let workspace: string;
let dir: string;
let empty: string;

beforeEach(async () => {
  fake.calls.length = 0;
  fake.fail = null;
  fake.write = true;
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-pdf-"));
  empty = await mkdtemp(path.join(tmpdir(), "explicai-nobrowser-"));
  dir = (await createManual(workspace, { title: "Financeiro Pro ✓", language: "pt-BR" })).dir;
  await addPage(dir, { title: "Início", body: "Texto" });
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(workspace, { recursive: true, force: true });
  await rm(empty, { recursive: true, force: true });
});

/** Um ambiente onde não há Chrome, Edge nem Chromium em nenhum dos lugares que o Explicaí procura. */
function withoutBrowser() {
  vi.stubEnv("EXPLICAI_BROWSER", path.join(empty, "nao-existe"));
  vi.stubEnv("PATH", empty);
  vi.stubEnv("PROGRAMFILES", empty);
  vi.stubEnv("PROGRAMFILES(X86)", empty);
  vi.stubEnv("LOCALAPPDATA", empty);
}

/** Um "navegador" que existe de verdade no disco (o executável do Node serve de arquivo). */
const withBrowser = () => vi.stubEnv("EXPLICAI_BROWSER", process.execPath);

describe("PDF sem navegador", () => {
  it("findBrowser devolve null e o PDF falha com o código no-browser e a instrução", async () => {
    withoutBrowser();
    expect(await findBrowser()).toBeNull();
    await expect(exportManual(dir, "pdf")).rejects.toMatchObject({
      code: "no-browser",
      message: expect.stringMatching(/Chrome, o Edge ou o Chromium.*EXPLICAI_BROWSER/s),
    });
    expect(fake.calls).toEqual([]);
  });

  it("não deixa PDF antigo nem perfil temporário para trás", async () => {
    withBrowser();
    const first = await exportManual(dir, "pdf");
    expect(await readdir(path.join(dir, "exportacao"))).toContain(path.basename(first.file));
    withoutBrowser();
    await expect(exportManual(dir, "pdf")).rejects.toMatchObject({ code: "no-browser" });
    expect(await readdir(path.join(dir, "exportacao"))).not.toContain(path.basename(first.file));
  });

  it("a rota responde 400 com o código no-browser (a interface traduz pelo código)", async () => {
    withoutBrowser();
    const server = createStudioServer({ workspace });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const res = await fetch(
        `http://localhost:${(server.address() as AddressInfo).port}/api/manuals/${path.basename(dir)}/export`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ format: "pdf" }),
        },
      );
      expect(res.status).toBe(400);
      expect(await res.json()).toMatchObject({ code: "no-browser", error: expect.stringContaining("EXPLICAI_BROWSER") });
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

describe("PDF com navegador (de mentira)", () => {
  it("chama o navegador sem janela, com perfil temporário, sem cabeçalho e com o HTML exportado", async () => {
    withBrowser();
    const result = await exportManual(dir, "pdf");
    expect(result).toMatchObject({ format: "pdf", file: "exportacao/financeiro-pro.pdf", pages: 1, warnings: [] });
    expect(fake.calls).toHaveLength(1);
    const { file, args } = fake.calls[0] ?? { file: "", args: [] };
    expect(file).toBe(process.execPath);
    expect(args).toEqual(
      expect.arrayContaining([
        "--headless=new",
        "--no-pdf-header-footer",
        `--print-to-pdf=${path.join(dir, "exportacao", "financeiro-pro.pdf")}`,
      ]),
    );
    const profile = args.find((a) => a.startsWith("--user-data-dir="))?.slice("--user-data-dir=".length) ?? "";
    expect(profile).toContain("explicai-pdf-");
    await expect(readdir(profile)).rejects.toThrow(); // o perfil temporário foi apagado
    expect(args.at(-1)).toMatch(/^file:\/\/\/.*exportacao\/html\/index\.html$/);
  });

  it("o PDF sai ao lado das pastas html e markdown, e o HTML dele também fica gravado", async () => {
    withBrowser();
    await exportManual(dir, "pdf");
    expect((await readdir(path.join(dir, "exportacao"))).sort()).toEqual(["financeiro-pro.pdf", "html"]);
  });

  it("exportar de novo substitui o PDF anterior", async () => {
    withBrowser();
    await exportManual(dir, "pdf");
    await writeFile(path.join(dir, "exportacao", "financeiro-pro.pdf"), "velho");
    fake.write = true;
    await exportManual(dir, "pdf");
    expect((await readdir(path.join(dir, "exportacao"))).filter((f) => f.endsWith(".pdf"))).toEqual(["financeiro-pro.pdf"]);
  });

  it("navegador que termina sem gerar o arquivo vira erro claro, e o perfil temporário é apagado", async () => {
    withBrowser();
    fake.write = false;
    await expect(exportManual(dir, "pdf")).rejects.toThrow("O navegador terminou sem gerar o PDF.");
    const profile = fake.calls[0]?.args.find((a) => a.startsWith("--user-data-dir="))?.slice("--user-data-dir=".length) ?? "";
    await expect(readdir(profile)).rejects.toThrow();
  });

  it("navegador que falha (código de saída, tempo esgotado) propaga o erro e apaga o perfil", async () => {
    withBrowser();
    fake.fail = new Error("Command failed: exit 1");
    await expect(exportManual(dir, "pdf")).rejects.toThrow("Command failed");
    const profile = fake.calls[0]?.args.find((a) => a.startsWith("--user-data-dir="))?.slice("--user-data-dir=".length) ?? "";
    await expect(readdir(profile)).rejects.toThrow();
  });

  it("EXPLICAI_BROWSER tem prioridade sobre os navegadores instalados", async () => {
    withBrowser();
    expect(await findBrowser()).toBe(process.execPath);
  });

  it("só as aprovadas: sem nenhuma aprovada o PDF nem tenta abrir o navegador", async () => {
    withBrowser();
    await expect(exportManual(dir, "pdf", { onlyApproved: true })).rejects.toMatchObject({ code: "no-approved-pages" });
    expect(fake.calls).toEqual([]);
  });
});
