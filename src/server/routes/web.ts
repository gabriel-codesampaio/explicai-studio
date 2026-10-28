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
      if (!opts.webDir) throw new HttpError(404, "Não encontrado.");
      const target = resolveInside(opts.webDir, rest || "index.html");
      const isFile = await stat(target).then((s) => s.isFile(), () => false);
      return isFile ? file(target, "max-age=3600") : file(path.join(opts.webDir, "index.html"));
    },
  },
];
