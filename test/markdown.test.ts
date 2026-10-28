// @vitest-environment happy-dom
import { Editor } from "@tiptap/core";
import { describe, expect, it } from "vitest";
import { toDiskMarkdown, toEditorMarkdown } from "../web/src/api.js";
import { contentExtensions } from "../web/src/extensions.js";

/** Abre o Markdown no editor e devolve o que ele gravaria, como acontece ao reabrir uma página. */
function roundTrip(md: string): string {
  const editor = new Editor({ extensions: contentExtensions(), content: md, contentType: "markdown" });
  const out = editor.getMarkdown();
  editor.destroy();
  return out;
}

/**
 * O editor pode normalizar a formatação (recuo de lista, alinhamento de tabela) nas primeiras aberturas.
 * Depois disso o texto não muda mais, e o conteúdo nunca se perde no caminho.
 */
function expectStable(md: string): string {
  const twice = roundTrip(roundTrip(md));
  expect(roundTrip(twice)).toBe(twice);
  return twice;
}

describe("Markdown do editor", () => {
  it("não perde a imagem dentro de um item de lista", () => {
    const md = "1. Clique em Novo cliente.\n2. Preencha o CPF.\n   ![Tela](../assets/tela.png)\n\nPronto.";
    const out = expectStable(md);
    expect(out).toContain("![Tela](../assets/tela.png)");
    expect(out).toContain("Pronto.");
  });

  it("mantém títulos, negrito, links, código e tabela", () => {
    const md = [
      "# Clientes",
      "",
      "Use **Novo cliente** ou veja [a ajuda](https://example.com).",
      "",
      "```bash",
      "npx explicai",
      "```",
      "",
      "| Campo | Obrigatório |",
      "| --- | --- |",
      "| CPF | Sim |",
    ].join("\n");
    const out = expectStable(md);
    for (const part of ["# Clientes", "**Novo cliente**", "[a ajuda](https://example.com)", "npx explicai"]) {
      expect(out).toContain(part);
    }
    expect(out).toMatch(/\|\s*CPF\s*\|\s*Sim\s*\|/);
  });
});

describe("caminhos de imagem", () => {
  it("converte entre o caminho do disco e a URL do Studio, nos dois sentidos", () => {
    const disk = "![Tela](../assets/tela.png)";
    const editor = toEditorMarkdown("financeiro", disk);
    expect(editor).toBe("![Tela](/files/financeiro/assets/tela.png)");
    expect(toDiskMarkdown(editor)).toBe(disk);
  });

  it("não mexe em imagem externa", () => {
    const md = "![Logo](https://example.com/logo.png)";
    expect(toDiskMarkdown(toEditorMarkdown("m", md))).toBe(md);
  });
});
