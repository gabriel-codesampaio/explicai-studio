import { createServer, type Server } from "node:http";
import { HttpError, send, sendJson, statusOf } from "./http.js";
import { matchRoute, type Route, type StudioOptions } from "./router.js";
import { assetRoutes } from "./routes/assets.js";
import { exportRoutes } from "./routes/export.js";
import { manualRoutes } from "./routes/manuals.js";
import { pageRoutes } from "./routes/pages.js";
import { versionRoutes } from "./routes/versions.js";
import { webRoutes } from "./routes/web.js";
import { assertLocalRequest } from "./security.js";

export type { StudioOptions } from "./router.js";

/** A ordem importa: a rota genérica do editor (`/*`) fica por último. */
const routes: Route[] = [...manualRoutes, ...pageRoutes, ...versionRoutes, ...exportRoutes, ...assetRoutes, ...webRoutes];

export function createStudioServer(opts: StudioOptions): Server {
  return createServer(async (req, res) => {
    try {
      assertLocalRequest(req);
      const url = new URL(req.url ?? "/", "http://localhost");
      const segments = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
      const method = req.method ?? "GET";
      const match = matchRoute(routes, method, segments);
      if (!match) throw new HttpError(segments[0] === "api" ? 405 : 404, "Rota não encontrada.");
      await send(res, await match.route.handle({ req, url, params: match.params, rest: match.rest, opts }));
    } catch (err) {
      sendJson(res, statusOf(err), { error: err instanceof Error ? err.message : String(err) });
    }
  });
}
