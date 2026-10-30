import type { Editor } from "@tiptap/react";
import { t } from "@/lib/i18n";
import { api, errorMessage } from "../../lib/api";
import { assetUrl } from "../../lib/imagePaths";

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

/** Envia as imagens para o manual e insere cada uma na posição `pos` do editor. */
export async function insertImages(
  editor: Editor,
  slug: string,
  files: File[],
  pos: number,
  onError: (message: string) => void,
): Promise<void> {
  let at = pos;
  for (const file of files) {
    try {
      const { path } = await api.uploadAsset(slug, file);
      const alt = file.name.replace(/\.[^.]+$/, "");
      editor
        .chain()
        .focus()
        .insertContentAt(at, { type: "image", attrs: { src: assetUrl(slug, path), alt } })
        .run();
      at += 1; // a próxima entra depois desta; na mesma posição a ordem sairia invertida
    } catch (err) {
      onError(errorMessage(err, t("Não foi possível enviar a imagem.")));
    }
  }
}
