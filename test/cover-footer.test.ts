import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { coverLines } from "../src/core/export/cover.js";
import { cssString, footerPageCss } from "../src/core/export/footer.js";
import { addPage, createManual, exportManual, readManual, setManualCover, setManualFooter } from "../src/core/index.js";

let workspace: string;
let dir: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-cover-"));
  dir = (await createManual(workspace, { title: "Manual", language: "pt-BR" })).dir;
  await addPage(dir, { title: "Início", body: "texto" });
});
afterEach(() => rm(workspace, { recursive: true, force: true }));

const html = async (audience?: string) => readFile(path.join(dir, (await exportManual(dir, "html", { audience })).file), "utf8");

describe("capa e rodapé: formato", () => {
  it("grava, aceita mudança parcial e apaga com null sem subir a version", async () => {
    await setManualCover(dir, { subtitle: " Para: Acme ", author: "Time" });
    await setManualCover(dir, { version: "Versão 2.1" });
    await setManualFooter(dir, { text: "Confidencial", pageNumbers: true });
    let meta = await readManual(dir);
    expect(meta.cover).toEqual({ subtitle: "Para: Acme", author: "Time", version: "Versão 2.1" });
    expect(meta.footer).toEqual({ text: "Confidencial", pageNumbers: true });
    expect(meta.version).toBe(1);
    await setManualCover(dir, { subtitle: null, author: "", version: null });
    await setManualFooter(dir, { text: null, pageNumbers: null });
    meta = await readManual(dir);
    expect(meta.cover).toBeUndefined();
    expect(meta.footer).toBeUndefined();
  });

  it("recusa texto acima do limite com o motivo e não grava nada", async () => {
    await setManualCover(dir, { author: "Time" });
    await expect(setManualCover(dir, { subtitle: "x".repeat(121), author: "Outro" })).rejects.toThrow(
      /subtítulo tem 121.*máximo é 120/,
    );
    await expect(setManualFooter(dir, { text: "y".repeat(101) })).rejects.toThrow(/rodapé tem 101.*máximo é 100/);
    await expect(setManualCover(dir, { date: 5 as unknown as string })).rejects.toThrow(/só texto/);
    const meta = await readManual(dir);
    expect(meta.cover).toEqual({ author: "Time" });
    expect(meta.footer).toBeUndefined();
    await setManualCover(dir, { subtitle: "x".repeat(120) });
  });
});

describe("capa e rodapé: HTML", () => {
  it("manual sem cover e footer exporta igual ao de hoje (vazios não mudam nada)", async () => {
    const before = await html();
    expect(before).not.toMatch(/cover-line|foot-text|@bottom-/);
    await setManualCover(dir, { subtitle: "x" });
    await setManualCover(dir, { subtitle: null });
    await setManualFooter(dir, { pageNumbers: false });
    expect(await html()).toBe(before);
  });

  it("capa mostra subtítulo, autor, versão e data nessa ordem, sem linha para campo vazio", async () => {
    await setManualCover(dir, { date: "outubro de 2026", subtitle: "Para: Acme", version: "Versão 2.1" });
    const doc = await html();
    const lines = [...doc.matchAll(/<p class="cover-line">([^<]*)<\/p>/g)].map((m) => m[1]);
    expect(lines).toEqual(["Para: Acme", "Versão 2.1", "outubro de 2026"]);
    expect(doc.indexOf('cover-line">Para')).toBeGreaterThan(doc.indexOf("<h1>"));
  });

  it("coverLines ignora valor que não é texto (manual.json editado à mão)", () => {
    expect(coverLines({ subtitle: 5, author: " Time " } as never)).toEqual(["Time"]);
  });

  it("texto com < \" '  e quebra de linha sai literal no HTML e no CSS do PDF", async () => {
    const nasty = `</style><script>x</script> "a" 'b' c\\d\ne`;
    await setManualCover(dir, { subtitle: nasty });
    await setManualFooter(dir, { text: nasty, pageNumbers: true });
    const doc = await html();
    const css = doc.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
    expect(css).not.toContain("</style");
    expect(doc.match(/<script/g)).toBeNull();
    expect(doc).toContain("&lt;/style&gt;&lt;script&gt;x&lt;/script&gt; &quot;a&quot; &#39;b&#39; c\\d\ne");
    expect(css).toContain('content:"\\3C /style>\\3C script>x\\3C /script> \\"a\\" \'b\' c\\\\d\\A e"');
    expect(css).toContain('@bottom-right{content:counter(page) " / " counter(pages)');
    expect(css).toContain("@page:first{@bottom-left{content:none}@bottom-right{content:none}}");
  });

  it("rodapé: texto sem número, só número, e a linha de tela entra no <footer> único", async () => {
    await setManualFooter(dir, { pageNumbers: true });
    let doc = await html();
    expect(doc).toContain("@bottom-right");
    expect(doc).not.toContain('@bottom-left{content:"');
    expect(doc).not.toContain('class="foot-text"');
    await setManualFooter(dir, { text: "Confidencial", pageNumbers: null });
    doc = await html();
    expect(doc).not.toContain("counter(pages)");
    expect(doc.match(/<footer/g)?.length).toBe(1);
    expect(doc).toContain('<p class="foot-text">Confidencial</p>Manual feito');
  });

  it("export com público leva a mesma capa e o mesmo rodapé", async () => {
    await setManualCover(dir, { author: "Time Acme" });
    await setManualFooter(dir, { text: "Confidencial" });
    const doc = await html("cliente");
    expect(doc).toContain('<p class="cover-line">Time Acme</p>');
    expect(doc).toContain("Confidencial</p>");
  });

  it("Markdown exportado não muda", async () => {
    const md = async () => readFile(path.join(dir, (await exportManual(dir, "markdown")).file), "utf8");
    const before = await md();
    await setManualCover(dir, { subtitle: "Para: Acme" });
    await setManualFooter(dir, { text: "Confidencial", pageNumbers: true });
    expect(await md()).toBe(before);
  });
});

describe("CSS do rodapé do PDF", () => {
  it("cssString escapa barra, aspas, < e quebra de linha", () => {
    expect(cssString('a\\b"c<d\r\ne')).toBe('"a\\\\b\\"c\\3C d\\A e"');
  });
  it("sem texto e sem número, nada", () => {
    expect(footerPageCss({}, "#000000")).toBe("");
  });
});
