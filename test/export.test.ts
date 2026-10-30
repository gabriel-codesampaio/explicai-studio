import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CALLOUT_COLORS } from "../src/core/export/callout.js";
import { contrast, contrastWithWhite, overWhite } from "../src/core/export/color.js";
import { imageSize } from "../src/core/export/imageSize.js";
import { TEXT_COLORS } from "../src/core/export/textColors.js";
import {
  addPage,
  createManual,
  exportManual,
  findBrowser,
  publishVersion,
  readManual,
  saveAsset,
  saveVersion,
  setManualTheme,
  updatePage,
  writeAnnotations,
} from "../src/core/index.js";

let workspace: string;
let dir: string;

/** Cabeçalho de PNG com largura e altura: é tudo que a exportação lê da imagem. */
function png(w: number, h: number): Uint8Array {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "ascii");
  b.writeUInt32BE(w, 16);
  b.writeUInt32BE(h, 20);
  return b;
}

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-export-"));
  dir = (await createManual(workspace, { title: "Financeiro Pro", language: "pt-BR" })).dir;
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

/** Manual com duas páginas, um passo com print marcado e uma subpágina com Versão do manual. */
async function seed() {
  const asset = await saveAsset(dir, "tela.png", png(800, 600));
  const visao = await addPage(dir, { title: "Visão geral", body: "Comece por aqui." });
  const clientes = await addPage(dir, {
    title: "Clientes",
    body: [
      "## Cadastrar",
      "",
      "1. Clique em **Novo cliente**.",
      "",
      `   ![Tela de clientes](../${asset})`,
      "",
      "   > **Resultado:** o formulário abre.",
      "",
      "Veja a [visão geral](./visao-geral.md) e <script>alert(1)</script> [isto](javascript:alert(1)).",
    ].join("\n"),
  });
  await writeAnnotations(dir, asset, {
    version: 1,
    markers: [{ id: "m1", n: 1, x: 0.25, y: 0.5, label: "Botão Novo cliente" }],
    highlights: [{ id: "h1", x: 0.1, y: 0.1, w: 0.2, h: 0.1 }],
    arrows: [{ id: "a1", from: { x: 0.1, y: 0.1 }, to: { x: 0.5, y: 0.5 } }],
    hotspots: [{ id: "s1", x: 0.6, y: 0.6, w: 0.2, h: 0.2, target: { type: "page", pageId: visao.id } }],
  });
  const sub = await addPage(dir, { title: "Editar", parentId: clientes.id, body: "Texto aprovado." });
  const v = await saveVersion(dir, sub.id);
  await publishVersion(dir, sub.id, v.id);
  await updatePage(dir, sub.id, { body: "Rascunho que não deve sair." });
  return { visao, clientes, sub, asset };
}

describe("exportação", () => {
  it("recusa exportar só as aprovadas quando nenhuma página está aprovada", async () => {
    await seed();
    await expect(exportManual(dir, "html", { onlyApproved: true })).rejects.toThrow(/aprovada/);
    await expect(exportManual(dir, "html", { onlyApproved: true })).rejects.toMatchObject({ code: "no-approved-pages" });
  });

  it("HTML: um arquivo com sumário numerado, marcações sobre o print e links entre páginas", async () => {
    const { visao, sub } = await seed();
    const result = await exportManual(dir, "html");
    expect(result).toMatchObject({ file: "exportacao/html/index.html", pages: 3, warnings: [] });
    const html = await readFile(path.join(dir, result.file), "utf8");

    expect(html).toContain('<span class="num">2.1</span> Editar');
    expect(html).toContain('<img src="assets/tela.png" alt="Tela de clientes"');
    expect(html).toContain("aspect-ratio:800 / 600");
    expect(html).toMatch(/class="mk" style="left:25\.000%;top:50\.000%"[^>]*>1</);
    expect(html).toContain("Botão Novo cliente");
    expect(html).toContain(`class="hot" href="#p-${visao.id}"`);
    expect(html).toContain(`<a href="#p-${visao.id}">visão geral</a>`);
    expect(html).toContain(`id="p-${sub.id}"`);
    expect(html).toContain("Texto aprovado.");
    expect(html).not.toContain("Rascunho que não deve sair.");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("javascript:");
    expect(await readFile(path.join(dir, "exportacao/html/assets/tela.png"))).toHaveLength(33);
  });

  it("HTML: leva as fontes da marca junto, sem depender de internet", async () => {
    await seed();
    const html = await readFile(path.join(dir, (await exportManual(dir, "html")).file), "utf8");
    const urls = [...html.matchAll(/@font-face\{font-family:"([^"]+)";src:url\((fonts\/[^)]+\.woff2)\)/g)];
    expect(new Set(urls.map((m) => m[1]))).toEqual(new Set(["Archivo", "Atkinson Hyperlegible Next", "JetBrains Mono"]));
    for (const m of urls) expect((await readFile(path.join(dir, "exportacao/html", m[2] ?? ""))).length).toBeGreaterThan(1000);
    for (const f of ["archivo", "atkinson-hyperlegible-next", "jetbrains-mono"]) {
      expect(await readFile(path.join(dir, `exportacao/html/fonts/OFL-${f}.txt`), "utf8")).toContain("Open Font License");
    }
    // npx explicai só leva o que está em "files": sem `fonts` ali, o export publicado sai sem fontes.
    const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
    expect(pkg.files).toContain("fonts");
  });

  it("títulos: nenhum salto de nível no HTML nem no Markdown", async () => {
    await addPage(dir, { title: "A", body: "## Um\n\n#### Fundo\n\n## Dois" });
    await addPage(dir, { title: "B", body: "# Um\n\n## Dois\n\n```\n# nao é título\n```" });
    const html = await readFile(path.join(dir, (await exportManual(dir, "html")).file), "utf8");
    const md = await readFile(path.join(dir, (await exportManual(dir, "markdown")).file), "utf8");
    const jumps = (levels: number[]) => levels.some((n, i) => n > (levels[i - 1] ?? 0) + 1);
    expect(jumps([...html.matchAll(/<h([1-6])[ >]/g)].map((m) => Number(m[1])))).toBe(false);
    // O sumário (## Sumário) vem antes das seções, então o salto conta a partir do h1 do manual.
    expect(jumps([...md.matchAll(/^(#{1,6}) /gm)].map((m) => m[1]?.length ?? 0))).toBe(false);
    expect(md).not.toContain("# nao é título\n\n```");
  });

  it("Markdown: um arquivo para IA, com a legenda do print em texto e dentro do passo", async () => {
    await seed();
    const result = await exportManual(dir, "markdown");
    const md = await readFile(path.join(dir, result.file), "utf8");

    expect(md).toMatch(/^# Financeiro Pro\n\n## Sumário\n\n- \[1 Visão geral\]\(#1-visao-geral\)/);
    expect(md).toContain("  - [2.1 Editar](#2-1-editar)");
    expect(md).toContain("## 2 Clientes\n\n### Cadastrar");
    expect(md).toContain(
      "   ![Tela de clientes](assets/tela.png)\n\n   > Legenda da imagem:\n   > 1. Botão Novo cliente\n" +
        '   > Área clicável: leva à página "Visão geral"',
    );
    expect(md).toContain("[visão geral](#1-visao-geral)");
    expect(md).not.toContain("Rascunho que não deve sair.");
  });

  it("cor do manual vai para o HTML e só aceita hexadecimal", async () => {
    await seed();
    await expect(setManualTheme(dir, { accent: "azul" })).rejects.toThrow(/Cor inválida/);
    await setManualTheme(dir, { accent: "#0F7A55" });
    expect((await readManual(dir)).theme).toEqual({ accent: "#0f7a55" });
    const html = await readFile(path.join(dir, (await exportManual(dir, "html")).file), "utf8");
    expect(html).toContain("--accent:#0f7a55");
    await setManualTheme(dir, { accent: null });
    expect((await readManual(dir)).theme).toBeUndefined();
  });

  it("lê o tamanho de PNG, GIF e JPEG pelo cabeçalho", async () => {
    const gif = Buffer.from("GIF89a\x40\x01\xf0\x00", "latin1");
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x02, 0x58, 0x03, 0x20, 0, 0, 0, 0, 0, 0]);
    const files = [
      ["a.png", png(1280, 720)],
      ["a.gif", gif],
      ["a.jpg", jpeg],
    ] as const;
    const sizes = [];
    for (const [name, data] of files) sizes.push(await imageSize(path.join(dir, await saveAsset(dir, name, data))));
    expect(sizes).toEqual([
      { w: 1280, h: 720 },
      { w: 320, h: 240 },
      { w: 800, h: 600 },
    ]);
  });

  it.skipIf(process.platform === "darwin")("PDF: sem navegador, o erro tem código para a interface traduzir", async () => {
    for (const v of ["PROGRAMFILES", "PROGRAMFILES(X86)", "LOCALAPPDATA", "PATH", "EXPLICAI_BROWSER"]) vi.stubEnv(v, "");
    try {
      await seed();
      await expect(exportManual(dir, "pdf")).rejects.toMatchObject({ code: "no-browser" });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it.skipIf(!process.env.CI_PDF && process.platform !== "win32")(
    "PDF: imprime o HTML com o navegador da máquina",
    async () => {
      if (!(await findBrowser())) return;
      await seed();
      const result = await exportManual(dir, "pdf");
      expect(result.file).toBe("exportacao/financeiro-pro.pdf");
      expect((await readFile(path.join(dir, result.file))).subarray(0, 5).toString()).toBe("%PDF-");
    },
    120_000,
  );
});

it("manual em inglês sai com os textos da exportação em inglês", async () => {
  const en = await createManual(workspace, { title: "Billing", language: "en-US" });
  const asset = await saveAsset(en.dir, "screen.png", png(400, 300));
  await writeAnnotations(en.dir, asset, {
    version: 1,
    markers: [{ id: "m1", n: 1, x: 0.5, y: 0.5 }],
    highlights: [],
    arrows: [],
    hotspots: [],
  });
  await addPage(en.dir, { title: "", body: `![Screen](../${asset})` });
  const md = await readFile(path.join(en.dir, (await exportManual(en.dir, "markdown")).file), "utf8");
  expect(md).toContain("## Contents");
  expect(md).toContain("## 1 Untitled");
  expect(md).toContain("> Image legend:\n> 1. (no description)");
  const html = await readFile(path.join(en.dir, (await exportManual(en.dir, "html")).file), "utf8");
  expect(html).toContain('<nav class="toc" aria-label="Contents">');
  expect(html).toContain("Manual made with Explicaí Studio.");
});

describe("exportação: cor do texto", () => {
  const body =
    'Clique em <span data-color="red">**Excluir**</span>, <span data-color="hotpink">rosa</span> e <span style="x">solto</span>.';

  it("HTML: só o span com cor da paleta passa, com contraste AA no branco; o resto continua escapado", async () => {
    await addPage(dir, { title: "Cores", body });
    const html = await readFile(path.join(dir, (await exportManual(dir, "html")).file), "utf8");
    expect(html).toContain('<span data-color="red"><strong>Excluir</strong></span>');
    expect(html).toContain("&lt;span data-color=&quot;hotpink&quot;&gt;");
    expect(html).toContain("&lt;span style=&quot;x&quot;&gt;");
    for (const [name, hex] of Object.entries(TEXT_COLORS)) {
      expect(html).toContain(`[data-color="${name}"]{color:${hex}}`);
      expect(contrastWithWhite(hex)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("Markdown: sai só o texto, sem o span", async () => {
    await addPage(dir, { title: "Cores", body });
    const md = await readFile(path.join(dir, (await exportManual(dir, "markdown")).file), "utf8");
    expect(md).toContain("Clique em **Excluir**,");
    expect(md).not.toContain('data-color="red"');
  });
});

describe("alertas no HTML", () => {
  const body = [
    "> [!TIP]",
    "> Salve com **Ctrl+S**.",
    "",
    "> [!WARNING]",
    ">",
    "> Isto muda o cadastro. <script>alert(1)</script>",
    "",
    "> [!CAUTION]",
    "> Não dá para desfazer.",
    "",
    "> [!NOTE]",
    "",
    "> [!IMPORTANT]",
    "> Fica como citação.",
    "",
    "> Citação comum.",
    "",
    "1. Exclua.",
    "",
    "   > [!CAUTION]",
    "   > Confirme antes.",
    "",
    "   > **Resultado:** some da lista.",
  ].join("\n");

  async function exported(language: string) {
    const m = await createManual(workspace, { title: `Alertas ${language}`, language });
    await addPage(m.dir, { title: "Cuidados", body });
    const r = await exportManual(m.dir, "html");
    return readFile(path.join(m.dir, r.file), "utf8");
  }

  it("mostra rótulo em texto e o corpo, sem o marcador, em cada tipo", async () => {
    const html = await exported("pt-BR");
    for (const [type, label] of [
      ["tip", "Dica"],
      ["warning", "Atenção"],
      ["caution", "Erro"],
      ["note", "Nota"],
    ]) {
      expect(html).toMatch(new RegExp(`<div class="callout" data-callout="${type}"[^>]*><p class="callout-label">${label}</p>`));
    }
    expect(html).toMatch(
      /data-callout="tip"[^>]*><p class="callout-label">Dica<\/p>\s*<p>Salve com <strong>Ctrl\+S<\/strong>\.<\/p>/,
    );
    expect(html).not.toMatch(/\[!(TIP|WARNING|CAUTION|NOTE)\]/);
    expect(html.match(/data-callout="caution"/g)).toHaveLength(2 + 1); // 2 no corpo + 1 na regra de CSS
  });

  it("segue o idioma do manual e deixa citação e Resultado como estavam", async () => {
    const html = await exported("en");
    expect(html).toContain('<p class="callout-label">Warning</p>');
    expect(html).toContain("<blockquote>\n<p>[!IMPORTANT]");
    expect(html).toContain("<blockquote>\n<p>Citação comum.</p>");
    expect(html).toContain("<strong>Resultado:</strong> some da lista.");
  });

  it("HTML colado dentro do alerta continua como texto", async () => {
    const html = await exported("pt-BR");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert(1)");
  });

  it("rótulo e texto passam de 4,5:1 sobre o fundo de cada tipo", () => {
    for (const hex of Object.values(CALLOUT_COLORS)) {
      const bg = overWhite(hex, 0.08);
      expect(contrast(hex, bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast("#151a33", bg)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
