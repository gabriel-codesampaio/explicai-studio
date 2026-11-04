import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { exportManual, readManual, readPage, updatePage } from "../src/core/index.js";

/** Manuais congelados de cada versão publicada (test/fixtures/manuais-antigos/<versão>). Nunca edite: copie para uma pasta nova. */
const FIXTURES = new URL("./fixtures/manuais-antigos/", import.meta.url);
const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";

let tmp: string;
beforeEach(async () => {
  tmp = await mkdtemp(path.join(tmpdir(), "explicai-old-"));
});
afterEach(() => rm(tmp, { recursive: true, force: true }));

describe.each(["0.1", "0.2", "0.3"])("manual da versão %s", (version) => {
  it("abre, edita uma página, salva e exporta HTML e Markdown", async () => {
    const dir = path.join(tmp, version);
    await cp(new URL(`${version}/`, FIXTURES), dir, { recursive: true });

    const meta = await readManual(dir);
    expect(meta.title).toBe("Financeiro");
    expect((await readPage(dir, A)).status).toBe("aprovado");

    await updatePage(dir, A, { body: "Texto **novo** depois da edição." });
    expect((await readPage(dir, A)).body).toContain("Texto **novo**");

    const html = await exportManual(dir, "html");
    const md = await exportManual(dir, "markdown");
    expect(html.warnings).toEqual([]);
    expect(md.warnings).toEqual([]);
    expect(html.pages).toBe(2);
    const htmlText = await readFile(path.join(dir, html.file), "utf8");
    const mdText = await readFile(path.join(dir, md.file), "utf8");
    for (const out of [htmlText, mdText]) {
      expect(out).toContain("Texto");
      expect(out).toContain("depois da edição");
      expect(out).toContain("versão publicada"); // a página B sai pela versão apontada em `published`
    }
  });

  it("não altera o que o manual antigo tinha fora da página editada", async () => {
    const dir = path.join(tmp, version);
    await cp(new URL(`${version}/`, FIXTURES), dir, { recursive: true });
    const before = JSON.parse(await readFile(path.join(dir, "manual.json"), "utf8"));
    const annBefore = await readFile(path.join(dir, "assets/tela.png.json"), "utf8");
    await updatePage(dir, B, { body: "Editada." });
    expect(JSON.parse(await readFile(path.join(dir, "manual.json"), "utf8"))).toEqual(before);
    expect(await readFile(path.join(dir, "assets/tela.png.json"), "utf8")).toBe(annBefore);
  });
});

describe("manual 0.3 com público", () => {
  it("exporta o conteúdo só para quem tem acesso", async () => {
    const dir = path.join(tmp, "0.3");
    await cp(new URL("0.3/", FIXTURES), dir, { recursive: true });
    const admin = await exportManual(dir, "markdown", { audience: "admin" });
    const adminText = await readFile(path.join(dir, admin.file), "utf8");
    expect(admin.pages).toBe(2);
    expect(adminText).toContain("Bem-vindo");
    expect(adminText).toContain("versão publicada");

    const outro = await exportManual(dir, "markdown", { audience: "cliente" });
    const outroText = await readFile(path.join(dir, outro.file), "utf8");
    expect(outro.pages).toBe(0);
    expect(outroText).not.toContain("Bem-vindo");
    expect(outroText).not.toContain("versão publicada");
  });
});
