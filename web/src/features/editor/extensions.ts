import type { AnyExtension } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";

/**
 * Extensões que definem o que o editor aceita e como vira Markdown. Usadas pelo editor e pelos testes.
 * O editor troca a imagem pela versão com marcações (`image`); os testes usam a comum, sem React.
 */
export function contentExtensions(image: AnyExtension = Image) {
  return [
    StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
    // No Markdown a imagem é inline (`![alt](src)` dentro de um parágrafo). Como bloco, ela se perdia
    // ao reabrir uma página com imagem dentro de um item de lista.
    image.configure({ inline: true }),
    TableKit.configure({ table: { resizable: false } }),
    Placeholder.configure({ placeholder: "Escreva aqui, ou digite / para inserir um bloco. Cole um print com Ctrl+V." }),
    Markdown.configure({ markedOptions: { gfm: true } }),
  ];
}
