import { fileURLToPath } from "node:url";
import { FONTS, FONTS_DIR, fontFiles } from "../../core/index.js";
import { file, HttpError, json } from "../http.js";
import type { Route } from "../router.js";

const FILES = new Set(FONTS.flatMap((f) => fontFiles(f).map((x) => x.file)));

/** As fontes que o manual exportado pode usar, para o Studio mostrar a prévia de cada uma. */
export const fontRoutes: Route[] = [
  {
    method: "GET",
    path: "/api/fonts",
    handle: () => json(FONTS.map((f) => ({ id: f.id, family: f.family, kind: f.kind, italic: f.italic, files: fontFiles(f) }))),
  },
  {
    method: "GET",
    path: "/api/fonts/:file",
    handle: ({ params }) => {
      const name = params.file ?? "";
      // Só os arquivos da lista: o nome vem da URL e não vira caminho de disco.
      if (!FILES.has(name)) throw new HttpError(404, "Fonte não encontrada.");
      return file(fileURLToPath(new URL(name, FONTS_DIR)), "max-age=86400");
    },
  },
];
