import { createServer, type Server } from "node:http";
import { ExplicaiError } from "../core/errors.js";
import { errorPage, pickLang } from "./errorPage.js";
import { HttpError, send, sendJson, statusOf } from "./http.js";
import { matchRoute, type Route, type StudioOptions } from "./router.js";
import { assetRoutes } from "./routes/assets.js";
import { exportRoutes } from "./routes/export.js";
import { fontRoutes } from "./routes/fonts.js";
import { manualRoutes } from "./routes/manuals.js";
import { pageRoutes } from "./routes/pages.js";
import { versionRoutes } from "./routes/versions.js";
import { webRoutes } from "./routes/web.js";
import { assertLocalRequest } from "./security.js";

export type { StudioOptions } from "./router.js";

/** A ordem importa: a rota genérica do editor (`/*`) fica por último. */
const routes: Route[] = [
  ...manualRoutes,
  ...pageRoutes,
  ...versionRoutes,
  ...exportRoutes,
  ...fontRoutes,
  ...assetRoutes,
  ...webRoutes,
];

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
      const { code, params } = err instanceof ExplicaiError ? err : ({} as Partial<ExplicaiError>);
      const errorCode = code ?? (err instanceof HttpError ? err.code : undefined);
      const status = statusOf(err);
      // Quem abre o Studio no navegador recebe uma página legível; a API e os arquivos continuam em JSON.
      const [first] = (req.url ?? "/").split("?")[0]?.split("/").filter(Boolean) ?? [];
      if (first !== "api" && first !== "files" && req.headers.accept?.includes("text/html")) {
        const html = errorPage(
          status,
          errorCode ?? (status === 404 ? "not-found" : "error"),
          pickLang(req.headers["accept-language"]),
        );
        res.writeHead(status, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
        return void res.end(html);
      }
      sendJson(res, status, { error: err instanceof Error ? err.message : String(err), code: errorCode, params });
    }
  });
}
