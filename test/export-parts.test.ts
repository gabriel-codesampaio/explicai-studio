import { mkdtemp, readFile, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { collectPages, type ExportPage } from "../src/core/export/collect.js";
import { labelsFor } from "../src/core/export/labels.js";
import { assetFromSrc, headingAnchor, loadImages, pageAnchor, pageLink, safeHref } from "../src/core/export/refs.js";
import { addPage, createManual, exportManual, publishVersion, saveAsset, saveVersion, updatePage } from "../src/core/index.js";

const page = (id: string, fileName: string, title = id): ExportPage => ({
  id,
  title,
  number: "1",
  depth: 0,
  fileName,
  body: "",
});

describe("assetFromSrc", () => {
  it("troca ../assets/ da página por assets/ do manual, decodificando %20", () => {
    expect(assetFromSrc("../assets/tela.png")).toBe("assets/tela.png");
    expect(assetFromSrc("../assets/minha%20tela.png")).toBe("assets/minha tela.png");
  });

  it("recusa o que não é imagem do manual: URL, data:, fora de assets/ e subida com ..", () => {
    for (const src of [
      "https://x.com/a.png",
      "http://x.com/a.png",
      "data:image/png;base64,AAAA",
      "javascript:alert(1)",
      "file:///etc/passwd",
      "../manual.json",
      "../pages/outra.md",
      "../../etc/passwd",
      "../assets/../manual.json",
      "../assets/../../x.png",
      "../assets/%2e%2e/%2e%2e/x.png",
      "/etc/passwd",
    ]) {
      expect(assetFromSrc(src), src).toBeNull();
    }
  });

  it("não derruba a exportação com % solto no endereço (URIError)", () => {
    expect(() => assetFromSrc("../assets/100%.png")).not.toThrow();
    expect(assetFromSrc("../assets/100%.png")).toBe("assets/100%.png");
  });
});

describe("âncoras e links entre páginas", () => {
  const pages = [page("id-a", "pagina-a.md", "A"), page("id-b", "cadastro de cliente.md", "B")];

  it("âncoras de página e de título", () => {
    expect(pageAnchor("id-a")).toBe("p-id-a");
    expect(headingAnchor("id-a", "Ação Rápida 2")).toBe("p-id-a--acao-rapida-2");
    expect(headingAnchor("id-a", '"><script>')).toMatch(/^p-id-a--[a-z0-9-]+$/);
  });

  it("./arquivo.md e arquivo.md viram âncora; com #seção vão para o título", () => {
    expect(pageLink("./pagina-a.md", pages)).toBe("#p-id-a");
    expect(pageLink("pagina-a.md", pages)).toBe("#p-id-a");
    expect(pageLink("./pagina-a.md#Ação Rápida", pages)).toBe("#p-id-a--acao-rapida");
    expect(pageLink("./cadastro%20de%20cliente.md", pages)).toBe("#p-id-b");
  });

  it("devolve null para página que não existe e para o que não é link de página", () => {
    for (const href of [
      "./sumiu.md",
      "https://a.com/pagina-a.md",
      "../pagina-a.md",
      "./sub/pagina-a.md",
      "#x",
      "mailto:a@b.c",
      "",
    ]) {
      expect(pageLink(href, pages), href).toBeNull();
    }
  });

  it("não derruba a exportação com % solto no link", () => {
    expect(() => pageLink("./100%.md", pages)).not.toThrow();
    expect(() => pageLink("./pagina-a.md#100%", pages)).not.toThrow();
  });
});

describe("safeHref", () => {
  it("deixa passar âncora, mailto, http e https, em qualquer caixa", () => {
    for (const href of ["#secao", "mailto:a@b.com", "http://a.com", "https://a.com/x?y=1#z", "HTTPS://A.COM", "MailTo:a@b.com"]) {
      expect(safeHref(href), href).toBe(href);
    }
  });

  it("recusa javascript:, data:, vbscript: e variações com caixa, espaço, tabulação e quebra de linha", () => {
    for (const href of [
      "javascript:alert(1)",
      "JAVASCRIPT:alert(1)",
      "JaVaScRiPt:alert(1)",
      " javascript:alert(1)",
      "\tjavascript:alert(1)",
      "\njavascript:alert(1)",
      "java\nscript:alert(1)",
      "java\tscript:alert(1)",
      "java script:alert(1)",
      "\u0000javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "DATA:text/html;base64,PHNjcmlwdD4=",
      "vbscript:msgbox(1)",
      "VBScript:msgbox(1)",
      "file:///etc/passwd",
      "ftp://a.com",
      "tel:+5511999999999",
      "//evil.com/x",
      "/api/manuals",
      "./pagina.md",
      " https://a.com",
      "&#106;avascript:alert(1)",
      "&#x6A;avascript:alert(1)",
      "javascript&colon;alert(1)",
      "javascript&#58;alert(1)",
      "%6Aavascript:alert(1)",
      "",
    ]) {
      expect(safeHref(href), JSON.stringify(href)).toBeNull();
    }
  });
});

describe("labelsFor", () => {
  it("português para pt, pt-BR, pt-PT e PT; inglês para o resto", () => {
    for (const l of ["pt", "pt-BR", "pt-PT", "PT-br"]) expect(labelsFor(l).toc, l).toBe("Sumário");
    for (const l of ["en", "en-US", "fr", "es-ES", "", "xx"]) expect(labelsFor(l).toc, l).toBe("Contents");
  });

  it("plural da contagem de páginas", () => {
    expect(labelsFor("pt-BR").pages(1)).toBe("1 página");
    expect(labelsFor("pt-BR").pages(0)).toBe("0 páginas");
    expect(labelsFor("pt-BR").pages(2)).toBe("2 páginas");
    expect(labelsFor("en").pages(1)).toBe("1 page");
    expect(labelsFor("en").pages(3)).toBe("3 pages");
  });

  it("frases de áreas clicáveis nos dois idiomas", () => {
    expect(labelsFor("pt-BR").hotspotUrl("https://a.com")).toContain("https://a.com");
    expect(labelsFor("en").hotspotPage("Home")).toBe('Clickable area: goes to the page "Home"');
    expect(labelsFor("pt-BR").hotspotPage("Início")).toBe('Área clicável: leva à página "Início"');
  });
});

describe("collectPages e loadImages", () => {
  vi.setConfig({ testTimeout: 30_000 }); // várias gravações em disco por teste; o antivírus do Windows atrasa
  let workspace: string;
  let dir: string;

  beforeEach(async () => {
    workspace = await mkdtemp(path.join(tmpdir(), "explicai-parts-"));
    dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
  });

  afterEach(async () => {
    await rm(workspace, { recursive: true, force: true });
  });

  it("numera 1, 2, 2.1 na ordem da árvore e guarda nome do arquivo e profundidade", async () => {
    const a = await addPage(dir, { title: "A" });
    const b = await addPage(dir, { title: "B" });
    await addPage(dir, { title: "B um", parentId: b.id });
    await addPage(dir, { title: "B dois", parentId: b.id });
    const { pages, warnings } = await collectPages(dir);
    expect(warnings).toEqual([]);
    expect(pages.map((p) => [p.number, p.title, p.depth, p.fileName])).toEqual([
      ["1", "A", 0, "a.md"],
      ["2", "B", 0, "b.md"],
      ["2.1", "B um", 1, "b-um.md"],
      ["2.2", "B dois", 1, "b-dois.md"],
    ]);
    expect(pages[0]?.id).toBe(a.id);
  });

  it("página sem título sai como Sem título (pt) ou Untitled (en)", async () => {
    await addPage(dir, { title: "" });
    expect((await collectPages(dir)).pages[0]?.title).toBe("Sem título");
    const en = (await createManual(workspace, { title: "En", language: "en-US" })).dir;
    await addPage(en, { title: "" });
    expect((await collectPages(en)).pages[0]?.title).toBe("Untitled");
  });

  it("só aprovadas: subpágina aprovada entra com a mãe em rascunho, e a numeração não tem buracos", async () => {
    const mae = await addPage(dir, { title: "Mãe" });
    const filha = await addPage(dir, { title: "Filha", parentId: mae.id });
    const outra = await addPage(dir, { title: "Outra" });
    await updatePage(dir, filha.id, { status: "aprovado" });
    await updatePage(dir, outra.id, { status: "publicado" });
    const { pages } = await collectPages(dir, { onlyApproved: true });
    expect(pages.map((p) => [p.number, p.title, p.depth])).toEqual([
      ["1", "Filha", 0],
      ["2", "Outra", 0],
    ]);
  });

  it("revisão e rascunho ficam de fora; sem o filtro, tudo entra", async () => {
    const a = await addPage(dir, { title: "A" });
    await addPage(dir, { title: "B" });
    await updatePage(dir, a.id, { status: "revisao" });
    expect((await collectPages(dir, { onlyApproved: true })).pages).toHaveLength(0);
    expect((await collectPages(dir)).pages).toHaveLength(2);
  });

  it("usa a Versão do manual no lugar do texto atual", async () => {
    const p = await addPage(dir, { title: "P", body: "Texto publicado" });
    const v = await saveVersion(dir, p.id);
    await publishVersion(dir, p.id, v.id);
    await updatePage(dir, p.id, { body: "Rascunho novo", title: "P novo" });
    const { pages } = await collectPages(dir);
    expect(pages[0]).toMatchObject({ title: "P", body: "Texto publicado" });
  });

  it("arquivo apagado e versão publicada que sumiu viram aviso; o resto continua e a filha sobe de número", async () => {
    const apagada = await addPage(dir, { title: "Apagada" });
    await addPage(dir, { title: "Filha da apagada", parentId: apagada.id });
    const semVersao = await addPage(dir, { title: "Sem versão" });
    const v = await saveVersion(dir, semVersao.id);
    await publishVersion(dir, semVersao.id, v.id);
    await unlink(path.join(dir, ".versoes", semVersao.id, `${v.id}.md`));
    await addPage(dir, { title: "Boa" });
    await unlink(path.join(dir, apagada.file));

    const { pages, warnings } = await collectPages(dir);
    expect(pages.map((p) => [p.number, p.title])).toEqual([
      ["1", "Filha da apagada"],
      ["2", "Boa"],
    ]);
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toMatch(/^pages\/apagada\.md: /);
    expect(warnings[1]).toMatch(/^pages\/sem-versao\.md: /);
  });

  it("loadImages ignora imagem de fora, apagada e repetida, e lê o tamanho do arquivo", async () => {
    const png = Buffer.alloc(33);
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png, 0);
    png.write("IHDR", 12, "ascii");
    png.writeUInt32BE(640, 16);
    png.writeUInt32BE(480, 20);
    const asset = await saveAsset(dir, "tela.png", png);
    const body = [
      `![a](../${asset})`,
      `![de novo](../${asset})`,
      "![fora](https://x.com/a.png)",
      "![sumiu](../assets/sumiu.png)",
    ].join("\n");
    await addPage(dir, { title: "P", body });
    const { pages } = await collectPages(dir);
    const images = await loadImages(dir, pages);
    expect([...images.keys()]).toEqual([asset]);
    expect(images.get(asset)?.size).toEqual({ w: 640, h: 480 });
    expect(images.get(asset)?.annotations.markers).toEqual([]);
  });

  it("exportar com % solto em imagem e link não quebra e mantém o texto", async () => {
    await addPage(dir, { title: "Alvo" });
    await addPage(dir, { title: "P", body: "[x](./100%.md) e ![y](../assets/100%.png) e [z](./alvo.md#100%)" });
    for (const format of ["html", "markdown"] as const) {
      const result = await exportManual(dir, format);
      expect((await readFile(path.join(dir, result.file), "utf8")).length).toBeGreaterThan(0);
    }
  });

  it("imagem de uma versão guardada não vaza para outro manual", async () => {
    const outro = (await createManual(workspace, { title: "Outro", language: "pt-BR" })).dir;
    const secret = await saveAsset(outro, "segredo.png", new Uint8Array([137, 80, 78, 71]));
    await writeFile(path.join(outro, "x.txt"), "x");
    await addPage(dir, { title: "P", body: `![x](../../${path.basename(outro)}/${secret})` });
    const { pages } = await collectPages(dir);
    expect((await loadImages(dir, pages)).size).toBe(0);
  });
});
