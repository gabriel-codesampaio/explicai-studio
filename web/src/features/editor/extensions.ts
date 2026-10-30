import type { AnyExtension, JSONContent, MarkdownRendererHelpers, RenderContext } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { ListItem } from "@tiptap/extension-list";
import Paragraph from "@tiptap/extension-paragraph";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";
import { t } from "../../lib/i18n";

/**
 * Item de lista que separa os blocos de dentro (texto, print, "Resultado:") por linha em branco.
 * O do Tiptap só deixava a linha em branco antes de parágrafo: a imagem ou a citação do passo
 * grudava no texto de cima ao reabrir, e a indentação encolhia a cada gravação.
 */
const StepListItem = ListItem.extend({
  renderMarkdown: (node: JSONContent, h: MarkdownRendererHelpers, ctx: RenderContext) => {
    const start = Number((ctx.meta?.parentAttrs as { start?: number } | undefined)?.start ?? 1);
    const prefix = ctx.parentType === "orderedList" ? `${start + (ctx.index ?? 0)}. ` : "- ";
    const pad = " ".repeat(prefix.length);
    const [first, ...rest] = node.content ?? [];
    let out = prefix + (first ? h.renderChildren([first]) : "");
    rest.forEach((child, i) => {
      const text = h.renderChild?.(child, i + 1) ?? h.renderChildren([child]);
      out += `\n\n${text
        .split("\n")
        .map((line) => (line ? pad + line : line))
        .join("\n")}`;
    });
    return out;
  },
});

/**
 * O Paragraph do Tiptap tira do parágrafo a imagem que está sozinha nele, o que a deixava inline na raiz
 * do documento: o ProseMirror não consegue dividir ali e o Enter não fazia nada. Mantém o parágrafo em volta.
 */
const ImageSafeParagraph = Paragraph.extend({
  parseMarkdown(token, h) {
    const parsed = this.parent?.(token, h);
    const list = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
    return list.map((n) => ("type" in n && n.type === "image" ? { type: "paragraph", content: [n] } : n));
  },
});

/**
 * Extensões que definem o que o editor aceita e como vira Markdown. Usadas pelo editor e pelos testes.
 * O editor troca a imagem pela versão com marcações (`image`); os testes usam a comum, sem React.
 */
export function contentExtensions(image: AnyExtension = Image) {
  return [
    StarterKit.configure({ link: { openOnClick: false, autolink: true }, listItem: false, paragraph: false }),
    ImageSafeParagraph,
    StepListItem,
    // No Markdown a imagem é inline (`![alt](src)` dentro de um parágrafo). Como bloco, ela se perdia
    // ao reabrir uma página com imagem dentro de um item de lista.
    image.configure({ inline: true }),
    TableKit.configure({ table: { resizable: false } }),
    Placeholder.configure({ placeholder: t("Escreva aqui, ou digite / para inserir um bloco. Cole um print com Ctrl+V.") }),
    Markdown.configure({ markedOptions: { gfm: true } }),
  ];
}
