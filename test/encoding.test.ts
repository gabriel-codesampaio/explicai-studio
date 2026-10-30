import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addPage,
  createManual,
  exportManual,
  listManuals,
  readManual,
  readPage,
  readPageTree,
  readVersion,
  removePage,
  restorePage,
  saveVersion,
  updatePage,
} from "../src/core/index.js";

/** Acento, emoji (par substituto) e CJK: o que vai para o disco volta igual, em UTF-8 sem BOM. */
const TITLE = "Ação ✓ 日本語 🚀 Revisão";
const BODY = "Olá, **mundo** 🌍\n\nSegunda linha com çãõ e 𝒳.\n";
const BOM = Buffer.from([0xef, 0xbb, 0xbf]);

let workspace: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-enc-"));
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

const startsWithBom = (b: Buffer) => b.subarray(0, 3).equals(BOM);
const withBom = async (file: string) => writeFile(file, Buffer.concat([BOM, await readFile(file)]));

describe("UTF-8 de ida e volta", () => {
  it("manual.json: título com acento e emoji volta igual, sem BOM e com \\n final", async () => {
    const { dir } = await createManual(workspace, { title: TITLE, language: "pt-BR" });
    const raw = await readFile(path.join(dir, "manual.json"));
    expect(startsWithBom(raw)).toBe(false);
    expect(raw.toString("utf8")).toContain(TITLE); // gravado como texto, não como \uXXXX
    expect(raw.toString("utf8").endsWith("}\n")).toBe(true);
    expect((await readManual(dir)).title).toBe(TITLE);
    expect((await listManuals(workspace))[0]?.meta.title).toBe(TITLE);
  });

  it("página: título e corpo voltam iguais, e o arquivo é UTF-8 sem BOM", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const page = await addPage(dir, { title: TITLE, body: BODY });
    const raw = await readFile(path.join(dir, page.file));
    expect(startsWithBom(raw)).toBe(false);
    expect(raw.toString("utf8")).toContain(TITLE);
    expect(await readPage(dir, page.id)).toMatchObject({ title: TITLE, body: BODY });
    expect((await readPageTree(dir))[0]?.title).toBe(TITLE);
  });

  it("título com caracteres de YAML (dois-pontos, #, aspas, começo com traço) volta igual", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const titles = [
      "Passo 1: entrar",
      "# não é comentário",
      'Ele disse "oi"',
      "- item",
      "'aspas'",
      "sim",
      "123",
      "a: b: c",
      "null",
    ];
    for (const title of titles) {
      const page = await addPage(dir, { title, body: "x" });
      expect((await readPage(dir, page.id)).title, title).toBe(title);
    }
  });

  it("nome de arquivo: acento sai sem acento e emoji puro vira sem-titulo, tudo em ASCII", async () => {
    const { dir } = await createManual(workspace, { title: "Ação Rápida", language: "pt-BR" });
    expect(path.basename(dir)).toBe("acao-rapida");
    const a = await addPage(dir, { title: "Configuração Rápida" });
    const b = await addPage(dir, { title: "🚀🚀" });
    const c = await addPage(dir, { title: "日本語" });
    expect(a.file).toBe("pages/configuracao-rapida.md");
    expect(b.file).toBe("pages/sem-titulo.md");
    expect(c.file).toBe("pages/sem-titulo-2.md");
    for (const f of await readdir(path.join(dir, "pages"))) expect(f).toMatch(/^[a-z0-9.-]+$/);
    // O título fica no frontmatter, intacto.
    expect((await readPage(dir, b.id)).title).toBe("🚀🚀");
  });

  it("renomear por título com acento mantém o corpo e atualiza o manual.json", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const page = await addPage(dir, { title: "Antes", body: BODY });
    const next = await updatePage(dir, page.id, { title: "Depois ✓ Ação" });
    expect(next.file).toBe("pages/depois-acao.md");
    expect(await readPage(dir, page.id)).toMatchObject({ title: "Depois ✓ Ação", body: BODY });
    expect((await readManual(dir)).pages[0]?.file).toBe("pages/depois-acao.md");
  });

  it("versões e lixeira guardam e devolvem UTF-8", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const page = await addPage(dir, { title: TITLE, body: BODY });
    const version = await saveVersion(dir, page.id, "Revisão ✓ final");
    expect((await readVersion(dir, page.id, version.id)).body).toBe(BODY);
    expect((await readVersion(dir, page.id, version.id)).note).toBe("Revisão ✓ final");
    await removePage(dir, page.id);
    const trashId = (await readdir(path.join(dir, ".lixeira")))[0] ?? "";
    await restorePage(dir, trashId);
    expect(await readPage(dir, page.id)).toMatchObject({ title: TITLE, body: BODY });
  });

  it("exportação em HTML e Markdown sai em UTF-8 sem BOM, com charset declarado", async () => {
    const { dir } = await createManual(workspace, { title: TITLE, language: "pt-BR" });
    await addPage(dir, { title: TITLE, body: BODY });
    const html = await exportManual(dir, "html");
    const md = await exportManual(dir, "markdown");
    const htmlBytes = await readFile(path.join(dir, html.file));
    const mdBytes = await readFile(path.join(dir, md.file));
    expect(startsWithBom(htmlBytes) || startsWithBom(mdBytes)).toBe(false);
    const htmlText = htmlBytes.toString("utf8");
    expect(htmlText).toContain('<meta charset="utf-8">');
    expect(htmlText).toContain(`<title>${TITLE}</title>`);
    expect(htmlText).toContain("Segunda linha com çãõ e 𝒳.");
    expect(htmlText).not.toContain("�");
    expect(mdBytes.toString("utf8")).toContain(`# ${TITLE}`);
    expect(mdBytes.toString("utf8")).toContain("Segunda linha com çãõ e 𝒳.");
  });
});

describe("BOM e CRLF vindos de editores do Windows", () => {
  it("manual.json com BOM abre", async () => {
    const { dir } = await createManual(workspace, { title: "Com BOM", language: "pt-BR" });
    await withBom(path.join(dir, "manual.json"));
    expect((await readManual(dir)).title).toBe("Com BOM");
    expect((await listManuals(workspace)).map((m) => m.meta.title)).toEqual(["Com BOM"]);
  });

  it("manual.json com CRLF abre e é regravado sem perder nada", async () => {
    const { dir } = await createManual(workspace, { title: "CRLF", language: "pt-BR" });
    const page = await addPage(dir, { title: "A" });
    const file = path.join(dir, "manual.json");
    await writeFile(file, (await readFile(file, "utf8")).replace(/\n/g, "\r\n"));
    expect((await readManual(dir)).pages[0]?.id).toBe(page.id);
    await updatePage(dir, page.id, { title: "B" });
    expect((await readManual(dir)).pages[0]?.file).toBe("pages/b.md");
  });

  it("página escrita à mão com BOM mantém título e corpo", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const page = await addPage(dir, { title: "Original", body: "corpo" });
    await withBom(path.join(dir, page.file));
    expect(await readPage(dir, page.id)).toMatchObject({ title: "Original", body: "corpo" });
    expect((await readPageTree(dir))[0]).toMatchObject({ title: "Original" });
  });

  it("página com CRLF (frontmatter e corpo) abre com título, status e corpo certos", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const page = await addPage(dir, { title: "Antiga" });
    const crlf = `---\r\nid: ${page.id}\r\ntitle: Cadastro ✓\r\nstatus: aprovado\r\n---\r\n\r\nPasso 1\r\n\r\nPasso 2\r\n`;
    await writeFile(path.join(dir, page.file), crlf);
    const read = await readPage(dir, page.id);
    expect(read).toMatchObject({ title: "Cadastro ✓", status: "aprovado" });
    expect(read.body.replace(/\r\n/g, "\n")).toBe("Passo 1\n\nPasso 2\n");
  });

  it("salvar uma página com CRLF não duplica nem perde linhas", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const page = await addPage(dir, { title: "P" });
    const body = "linha 1\r\n\r\nlinha 2\r\n";
    await updatePage(dir, page.id, { body });
    expect((await readPage(dir, page.id)).body).toBe(body);
  });

  it("exportar página com CRLF dá o mesmo resultado que com LF", async () => {
    const { dir } = await createManual(workspace, { title: "M", language: "pt-BR" });
    const lf = "# Seção\n\nTexto com **negrito**.\n\n1. Um\n2. Dois\n";
    const page = await addPage(dir, { title: "P", body: lf });
    const run = async () => {
      const html = await readFile(path.join(dir, (await exportManual(dir, "html")).file), "utf8");
      const md = await readFile(path.join(dir, (await exportManual(dir, "markdown")).file), "utf8");
      return { html: html.replace(/\r\n/g, "\n").replace(/>\s+</g, "><"), md: md.replace(/\r\n/g, "\n") };
    };
    const a = await run();
    await updatePage(dir, page.id, { body: lf.replace(/\n/g, "\r\n") });
    const b = await run();
    expect(b.html).toBe(a.html);
    expect(b.md).toBe(a.md);
  });
});
