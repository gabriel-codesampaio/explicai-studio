import { checkManual } from "../../core/index.js";
import { json } from "../http.js";
import type { Route } from "../router.js";
import { manualDir } from "../workspace.js";

export const checkRoutes: Route[] = [
  {
    // Só leitura: devolve CheckFinding[] (pageId, title, kind, detail). Funciona também em manual de formato mais novo.
    method: "GET",
    path: "/api/manuals/:slug/check",
    handle: async (ctx) => json(await checkManual(manualDir(ctx), { allowNewer: true })),
  },
];
