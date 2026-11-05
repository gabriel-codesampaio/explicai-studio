import { searchBodies } from "../../core/index.js";
import { json } from "../http.js";
import type { Route } from "../router.js";
import { manualDir } from "../workspace.js";

/** Busca no corpo das páginas (só leitura: vale também para manual de formato mais novo). */
export const searchRoutes: Route[] = [
  {
    method: "GET",
    path: "/api/manuals/:slug/search",
    handle: async (ctx) =>
      json(await searchBodies(manualDir(ctx), (ctx.url.searchParams.get("q") ?? "").slice(0, 100), { allowNewer: true })),
  },
];
