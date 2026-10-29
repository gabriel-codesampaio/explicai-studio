import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageView } from "./ImageView";

export interface AnnotatedImageOptions {
  /** Manual aberto: as marcações são buscadas em /api/manuals/<slug>/annotations. */
  slug: string;
}

/**
 * A imagem do Tiptap com a visualização das marcações. O Markdown que ela gera é o mesmo da
 * imagem comum, então abrir e salvar a página continua sem perda.
 */
export const AnnotatedImage = Image.extend<AnnotatedImageOptions & Record<string, unknown>>({
  addOptions() {
    return { ...this.parent?.(), slug: "" };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});
