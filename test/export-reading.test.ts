import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addPage, createManual, exportManual, saveAsset } from "../src/core/index.js";

let workspace: string;
let dir: string;

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
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-reading-"));
  dir = (await createManual(workspace, { title: "Piloto", language: "pt-BR" })).dir;
});
afterEach(async () => {
  await rm(workspace, { recursive: true, force: true });
});

const html = async (opts = {}) => readFile(path.join(dir, (await exportManual(dir, "html", opts)).file), "utf8");
const QUOTE = /<blockquote>\n<p><strong>Resultado:<\/strong> /;

describe("leitura do HTML exportado", () => {
  it('"Resultado:" em linha própria, na mesma linha ou em lista solta vira o destaque do passo', async () => {
    await addPage(dir, {
      title: "Passos",
      body: [
        "1. Clique em **Salvar**.",
        "   Resultado: a tela fecha.",
        "2. Abra o menu. **Resultado:** o menu aparece.",
        "",
        "3. Role a página.",
        "",
        "   Resultado: o rodapé surge.",
        "",
        "Resultado: fora de passo fica como texto.",
      ].join("\n"),
    });
    const out = await html();
    expect(out.match(new RegExp(QUOTE.source, "g"))).toHaveLength(3);
    expect(out).toContain("Clique em <strong>Salvar</strong>.");
    expect(out).toContain("<li><p>Abra o menu.</p>");
    expect(out).toContain("<p>Resultado: fora de passo fica como texto.</p>");
  });

  it('"Result:" em manual em inglês também vira o destaque, com o rótulo como foi escrito', async () => {
    await addPage(dir, {
      title: "Steps",
      body: "1. Open the menu. Result: the menu appears.\n2. Save.\n   **Result:** it saves.",
    });
    const out = await html();
    expect(out).toContain("<blockquote>\n<p><strong>Result:</strong> the menu appears.");
    expect(out).toContain("<blockquote>\n<p><strong>Result:</strong> it saves.");
  });

  it("texto depois de Resultado: passa pelo mesmo filtro de HTML e mantém a cor e o link", async () => {
    await addPage(dir, {
      title: "Filtro",
      body: [
        '1. Abra. Resultado: <img src=x onerror="alert(1)"> fim.',
        '2. Abra. Resultado: <span data-color="red">vermelho</span> e [site](https://exemplo.com).',
        "3. Abra. <script>alert(2)</script> Resultado: [ruim](javascript:alert(3)).",
      ].join("\n"),
    });
    const out = await html();
    const passos = out.slice(out.indexOf("<p><strong>Resultado:"), out.lastIndexOf("</ol>"));
    expect(passos).not.toMatch(/<img src=x|<script>alert|href="javascript/i);
    expect(out).toContain('href="https://exemplo.com"');
    expect(out).toMatch(/<span[^>]*color[^>]*>vermelho<\/span>/);
  });

  it("passo sem texto depois de Resultado: não vira citação, e o Markdown segue igual", async () => {
    await addPage(dir, { title: "Passos", body: "1. Clique.\n   Resultado:\n" });
    expect(await html()).not.toMatch(QUOTE);
    const md = await readFile(path.join(dir, (await exportManual(dir, "markdown")).file), "utf8");
    expect(md).toContain("Resultado:");
    expect(md).not.toContain("<blockquote>");
  });

  it("passo depois de imagem continua a contagem: <ol start> e número pelo contador nativo", async () => {
    await addPage(dir, { title: "Passos", body: "1. Abra.\n\n![A](../x.png)\n\n2. Clique.\n3. Salve." });
    const out = await html();
    expect(out).toContain('<ol start="2">');
    expect(out).toContain("content:counter(list-item)");
    expect(out).not.toContain("counter-reset:passo");
  });

  it("divisor `---` vira <hr> no HTML e fica `---` no Markdown", async () => {
    await addPage(dir, { title: "Divisor", body: "Antes.\n\n---\n\nDepois." });
    const out = await html();
    expect(out).toMatch(/<hr\s*\/?>/);
    expect(out).toContain(".page-body hr{");
    const md = await readFile(path.join(dir, (await exportManual(dir, "markdown")).file), "utf8");
    expect(md).toContain("Antes.\n\n---\n\nDepois.");
  });

  it("print largo leva link para o original; print estreito, não", async () => {
    const wide = await saveAsset(dir, "larga.png", png(2560, 400));
    const small = await saveAsset(dir, "pequena.png", png(300, 200));
    await addPage(dir, { title: "Prints", body: `![A](../${wide})\n\n![B](../${small})` });
    const out = await html();
    expect(out).toMatch(/<a class="zoom" href="assets\/larga\.png" target="_blank" rel="noopener"><img [^>]*alt="A"/);
    expect(out).not.toContain('href="assets/pequena.png"');
    expect(out).not.toContain("<script");
  });

  it("sumário traz as seções, é recolhível e cada página volta a ele", async () => {
    await addPage(dir, { title: "Comprar", body: "## Pagar\n\nx\n\n### Pix\n\ny" });
    const out = await html();
    expect(out).toMatch(/<nav class="toc" id="sumario"[^>]*>[\s\S]*<details open>\n<summary>Sumário<\/summary>/);
    expect(out).toMatch(/<li class="sec" style="--d:1"><a href="#p-[^"]+--pagar">Pagar<\/a><\/li>/);
    expect(out).toMatch(/<li class="sec" style="--d:2"><a href="#p-[^"]+--pix">Pix<\/a><\/li>/);
    expect(out).toContain('<a class="back" href="#sumario">Voltar ao sumário</a>');
  });

  it("capa diz por onde começar e quanto leva; páginas ganham anterior e próxima", async () => {
    const a = await addPage(dir, { title: "Primeira", body: "um dois três" });
    const b = await addPage(dir, { title: "Segunda", body: "quatro" });
    const out = await html();
    expect(out).toContain(`Comece por <a href="#p-${a.id}">Primeira</a>`);
    expect(out).toContain("2 páginas, cerca de 1 min de leitura");
    expect(out).toContain(`rel="next" href="#p-${b.id}"`);
    expect(out).toContain(`rel="prev" href="#p-${a.id}"`);
    expect(out.match(/rel="prev"/g)).toHaveLength(1);
    expect(out.match(/rel="next"/g)).toHaveLength(1);
  });

  it("por público: página de outro perfil não aparece no sumário, na capa nem em anterior/próxima", async () => {
    const SECRET = "Cobranças secretas";
    const a = await addPage(dir, { title: "Visão geral", body: "## Início\n\nok" });
    const hid = await addPage(dir, { title: SECRET, audience: ["admin"], body: "## Seção secreta\n\nx" });
    const c = await addPage(dir, { title: "Pedidos", audience: ["cliente"], body: "ok" });
    const out = await html({ audience: "cliente" });
    expect(out).not.toContain(SECRET);
    expect(out).not.toContain("Seção secreta");
    expect(out).not.toContain(hid.id);
    expect(out).toContain(`rel="next" href="#p-${c.id}"`);
    expect(out).toContain(`rel="prev" href="#p-${a.id}"`);
    expect(out).toContain("2 páginas");
  });

  it("manual vazio e manual com página sem título exportam sem erro", async () => {
    expect(await html()).toContain("0 páginas");
    await addPage(dir, { title: "", body: "Texto sem título e sem passos." });
    expect(await html()).toContain("Texto sem título");
  });
});
