import type { Transaction } from "@tiptap/pm/state";
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
  // O texto pode mudar durante o envio: a posição acompanha cada transação.
  const follow = ({ transaction }: { transaction: Transaction }) => {
    at = transaction.mapping.map(at);
  };
  editor.on("transaction", follow);
  try {
    await send();
  } finally {
    editor.off("transaction", follow);
  }

  async function send() {
    for (const file of files) {
      try {
        const { path } = await api.uploadAsset(slug, file);
        const alt = file.name.replace(/\.[^.]+$/, "");
        // O mapa empurra `at` para depois da imagem inserida: a próxima entra atrás dela.
        editor
          .chain()
          .focus()
          .insertContentAt(Math.min(at, editor.state.doc.content.size), {
            type: "image",
            attrs: { src: assetUrl(slug, path), alt },
          })
          .run();
      } catch (err) {
        onError(errorMessage(err, t("Não foi possível enviar a imagem.")));
      }
    }
  }
}
