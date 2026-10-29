import { stat } from "node:fs/promises";
import path from "node:path";
import { resolveInside } from "../../core/index.js";
import { file, HttpError } from "../http.js";
import type { Route } from "../router.js";

/** Arquivos do editor. Caminho que não é arquivo cai no index.html (aplicação de página única). */
export const webRoutes: Route[] = [
  {
    method: "GET",
    path: "/*",
    handle: async ({ opts, rest }) => {
      // Chamada de API errada não pode receber o index.html do editor como resposta.
      if (!opts.webDir || rest === "api" || rest.startsWith("api/")) throw new HttpError(404, "Não encontrado.");
      const target = resolveInside(opts.webDir, rest || "index.html");
      const isFile = await stat(target).then(
        (s) => s.isFile(),
        () => false,
      );
      // Só os arquivos com hash no nome (assets/) podem ficar em cache; o index.html muda a cada build.
      if (isFile && rest.startsWith("assets/")) return file(target, "max-age=31536000, immutable");
      return file(isFile ? target : path.join(opts.webDir, "index.html"));
    },
  },
];
