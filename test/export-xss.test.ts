import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addPage, createManual, exportManual, saveAsset, setManualTheme, writeAnnotations } from "../src/core/index.js";

/** O manual exportado é aberto por quem recebe o arquivo: nada que a pessoa escreveu pode virar código. */
let workspace: string;
let dir: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-xss-"));
});

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

const PAYLOAD = `"><script>alert(1)</script><img src=x onerror=alert(2)>`;
const png = () => new Uint8Array([137, 80, 78, 71]);

async function html(): Promise<string> {
  return readFile(path.join(dir, (await exportManual(dir, "html")).file), "utf8");
}

/** Tags reais do HTML gerado, com o texto escapado já fora. O CSS e o SVG das setas são do próprio exportador. */
function tags(doc: string): string[] {
  return [...doc.replace(/<style>[\s\S]*?<\/style>/, "").matchAll(/<([a-z][a-z0-9]*)\b[^>]*>/gi)].map((m) => m[0]);
}

function expectNoActiveContent(doc: string) {
  const all = tags(doc);
  expect(all.filter((t) => /^<(script|iframe|object|embed|link|base|form|meta http-equiv)/i.test(t))).toEqual([]);
  // Sem os valores entre aspas: "onerror=" escapado dentro do alt é texto, não atributo.
  expect(
    all.filter((t) => /\son[a-z]+\s*=/i.test(t.replace(/"[^"]*"/g, '""'))),
    "atributo de evento",
  ).toEqual([]);
  expect(
    all.filter((t) => /(href|src)\s*=\s*"\s*(javascript|data|vbscript):/i.test(t)),
    "URL perigosa",
  ).toEqual([]);
}

describe("exportação: escape contra XSS", () => {
  it("título do manual, idioma, título de página e sumário saem escapados", async () => {
    dir = (await createManual(workspace, { title: `Manual ${PAYLOAD}`, language: `pt-BR${PAYLOAD}` })).dir;
    await addPage(dir, { title: `Página ${PAYLOAD}`, body: "texto" });
    const doc = await html();
    expectNoActiveContent(doc);
    expect(doc).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(doc).toContain(`<title>Manual &quot;&gt;&lt;script&gt;`);
    expect(doc).toContain(`<html lang="pt-BR&quot;&gt;&lt;script&gt;`);
    expect((doc.match(/<script/g) ?? []).length).toBe(0);
  });

  it("HTML solto no corpo vira texto: script, iframe, img com onerror, style, svg e comentário", async () => {
    dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
    const body = [
      "<script>alert(1)</script>",
      "",
      "<iframe src=//evil.com></iframe>",
      "",
      "Texto <img src=x onerror=alert(1)> no meio e <b onmouseover=alert(2)>negrito</b>.",
      "",
      "<style>body{display:none}</style>",
      "",
      "<svg onload=alert(1)></svg>",
      "",
      "<!-- <script>alert(1)</script> -->",
      "",
      '<a href="javascript:alert(1)">clique</a>',
      "",
      '<span data-color="red" onclick="alert(1)">x</span>',
      "",
      '<span data-color="javascript:alert(1)">y</span>',
    ].join("\n");
    await addPage(dir, { title: "P", body });
    const doc = await html();
    expectNoActiveContent(doc);
    expect(doc).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(doc).toContain("&lt;iframe");
    expect(doc).toContain("&lt;img src=x onerror=alert(1)&gt;");
    // Só o sumário tem <a> (âncoras #p-…); <b>, <style> e <svg> não vêm do texto do autor.
    expect(tags(doc).filter((t) => /^<(style|svg|b)\b/i.test(t) || /^<a\b(?![^>]*href="#p-)/i.test(t))).toEqual([]);
    expect(doc).not.toContain('onclick="alert');
  });

  it("links: só http, https, mailto e âncora viram <a>; o resto fica como texto, sem o endereço", async () => {
    dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
    const bad = [
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      "<javascript:alert(1)>",
      "&#106;avascript:alert(1)",
      "&#x6A;avascript:alert(1)",
      "javascript&colon;alert(1)",
      "java%0Ascript:alert(1)",
      "data:text/html,%3Cscript%3Ealert(1)%3C/script%3E",
      "vbscript:msgbox(1)",
      "file:///etc/passwd",
    ];
    const body = [
      ...bad.map((href, i) => `[ruim ${i}](${href})`),
      "[Boa](https://ok.com/a?x=1&y=2) [Mail](mailto:a@b.com) [Seção](#secao)",
      "",
      "[por referência][r]",
      "",
      "[r]: javascript:alert(1)",
      "",
      "Autolink <javascript:alert(1)> e <https://auto.com>.",
    ].join("\n");
    await addPage(dir, { title: "P", body });
    const doc = await html();
    expectNoActiveContent(doc);
    const hrefs = tags(doc)
      .map((t) => /^<a\b[^>]*\shref="([^"]*)"/.exec(t)?.[1])
      .filter((h): h is string => Boolean(h) && !h?.startsWith("#p-"));
    expect(hrefs.sort()).toEqual(["#secao", "https://auto.com", "https://ok.com/a?x=1&amp;y=2", "mailto:a@b.com"].sort());
    expect(doc).toContain("ruim 0");
    expect(doc).toMatch(/<a href="https:\/\/ok\.com[^"]*" rel="noopener noreferrer">Boa<\/a>/);
  });

  it("imagem: alt e src perigosos não saem como atributo ativo", async () => {
    dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
    const asset = await saveAsset(dir, "tela.png", png());
    await addPage(dir, {
      title: "P",
      body: [
        `![${PAYLOAD.replace(/[[\]]/g, "")}](../${asset})`,
        `![a](javascript:alert(1))`,
        `![b](data:image/svg+xml,<svg onload=alert(1)>)`,
        `![c](https://evil.com/track.png)`,
        `![d"onerror="alert(1)](../assets/nao-existe.png)`,
      ].join("\n\n"),
    });
    const doc = await html();
    expectNoActiveContent(doc);
    expect(tags(doc).filter((t) => t.startsWith("<img"))).toHaveLength(1);
    expect(doc).toContain('alt="&quot;&gt;&lt;script&gt;');
    expect(doc).toContain("imagem não encontrada");
    expect(doc).not.toContain("evil.com/track.png");
  });

  it("legenda, área clicável por url e por página: rótulo e título saem escapados, e url ruim some", async () => {
    dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
    const asset = await saveAsset(dir, "tela.png", png());
    const alvo = await addPage(dir, { title: `Alvo ${PAYLOAD}` });
    await addPage(dir, { title: "P", body: `![x](../${asset})` });
    await writeAnnotations(dir, asset, {
      version: 1,
      markers: [{ id: "m1", n: 1, x: 0.1, y: 0.1, label: PAYLOAD }],
      highlights: [],
      arrows: [],
      hotspots: [
        { id: "s1", x: 0, y: 0, w: 0.1, h: 0.1, target: { type: "page", pageId: alvo.id } },
        { id: "s2", x: 0.2, y: 0, w: 0.1, h: 0.1, target: { type: "url", href: `https://ok.com/"onmouseover="alert(1)` } },
        { id: "s3", x: 0.4, y: 0, w: 0.1, h: 0.1, target: { type: "anchor", pageId: alvo.id, anchor: PAYLOAD } },
      ],
    });
    const doc = await html();
    expectNoActiveContent(doc);
    expect(doc).toContain('<span class="n">1</span><span>&quot;&gt;&lt;script&gt;');
    expect(doc).toContain("Ir para Alvo &quot;&gt;&lt;script&gt;");
    expect(doc).not.toContain('onmouseover="alert');
  });

  it("título com HTML dentro do texto e nos títulos do corpo, em tabela, código e citação", async () => {
    dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
    await addPage(dir, {
      title: "P",
      body: [
        `# Título <img src=x onerror=alert(1)>`,
        "",
        "| a | b |",
        "|---|---|",
        "| <script>x</script> | `<script>y</script>` |",
        "",
        "```html",
        "<script>alert(1)</script>",
        "```",
        "",
        "> <iframe src=x></iframe>",
        "",
        "1. passo <u onclick=alert(1)>sublinhado</u>",
      ].join("\n"),
    });
    const doc = await html();
    expectNoActiveContent(doc);
    expect(tags(doc).filter((t) => /^<(iframe|u|script)\b/i.test(t))).toEqual([]);
  });

  it("tema: valor que não é hexadecimal é recusado e nada vai para o CSS", async () => {
    dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
    for (const accent of ["red;}</style><script>alert(1)</script>", "#2b4fe0;}body{display:none", "url(javascript:alert(1))"]) {
      await expect(setManualTheme(dir, { accent }), accent).rejects.toThrow();
    }
    await expect(setManualTheme(dir, { fonts: { text: "x;}</style><script>" } })).rejects.toThrow();
    await addPage(dir, { title: "P" });
    expect(await html()).not.toContain("<script");
  });

  it("Markdown exportado não leva HTML novo: o texto do autor passa como está, sem criar tags", async () => {
    dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
    await addPage(dir, { title: "P", body: '<span data-color="red">vermelho</span> e <span data-color="x">outro</span>' });
    const md = await readFile(path.join(dir, (await exportManual(dir, "markdown")).file), "utf8");
    expect(md).toContain("vermelho e");
    expect(md).not.toContain('data-color="red"');
  });
});
