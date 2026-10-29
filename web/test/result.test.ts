// @vitest-environment happy-dom
import { Editor } from "@tiptap/core";
import { describe, expect, it } from "vitest";
import { BLOCKS } from "../src/features/editor/blocks";
import { contentExtensions } from "../src/features/editor/extensions";

const result = BLOCKS.find((b) => b.id === "result");

/** Põe o cursor no fim do texto `at`, roda "Resultado esperado" e digita `typed`. */
function insertAfter(md: string, at: string, typed: string): string {
  const editor = new Editor({ extensions: contentExtensions(), content: md, contentType: "markdown" });
  let pos = 0;
  editor.state.doc.descendants((node, p) => {
    if (node.isText && node.text?.includes(at)) pos = p + (node.text.indexOf(at) + at.length);
  });
  editor.commands.setTextSelection(pos);
  // biome-ignore lint/suspicious/noExplicitAny: o editor do core basta para o comando; o de React só acrescenta a view
  result?.run({ editor: editor as any, pickImage: () => {} });
  editor.commands.insertContent(typed);
  const out = editor.getMarkdown().trimEnd();
  editor.destroy();
  return out;
}

describe('bloco "Resultado esperado"', () => {
  it("entra dentro do passo, depois do texto, com o cursor pronto para escrever", () => {
    const out = insertAfter("1. Clique em **Novo cliente**.\n2. Preencha o nome.", "Novo cliente", "o formulário abre.");
    expect(out).toBe("1. Clique em **Novo cliente**.\n\n   > **Resultado:** o formulário abre.\n2. Preencha o nome.");
  });

  it("numa linha vazia, ocupa o lugar dela", () => {
    const editor = new Editor({ extensions: contentExtensions(), content: "<p>Antes</p><p></p>" });
    editor.commands.setTextSelection(editor.state.doc.content.size - 1);
    // biome-ignore lint/suspicious/noExplicitAny: ver acima
    result?.run({ editor: editor as any, pickImage: () => {} });
    editor.commands.insertContent("tudo certo.");
    expect(editor.getMarkdown().trimEnd()).toBe("Antes\n\n> **Resultado:** tudo certo.");
    editor.destroy();
  });
});
