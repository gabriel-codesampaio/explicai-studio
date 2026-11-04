import { addAudience, removeAudience, renameAudience } from "../../core/index.js";
import { HttpError, json, readJson } from "../http.js";
import type { Route } from "../router.js";
import { manualDir } from "../workspace.js";

const ONE = "/api/manuals/:slug/audiences/:name";

/** `name` do corpo: texto obrigatório (o tamanho e o vazio o core confere e explica). */
function nameOf(body: Record<string, unknown>): string {
  if (typeof body.name !== "string") throw new HttpError(400, "name deve ser um texto.");
  return body.name;
}

export const audienceRoutes: Route[] = [
  {
    method: "POST",
    path: "/api/manuals/:slug/audiences",
    handle: async (ctx) => json({ name: await addAudience(manualDir(ctx), nameOf(await readJson(ctx.req))) }, 201),
  },
  {
    method: "PATCH",
    path: ONE,
    handle: async (ctx) => json(await renameAudience(manualDir(ctx), ctx.params.name ?? "", nameOf(await readJson(ctx.req)))),
  },
  {
    method: "DELETE",
    path: ONE,
    handle: async (ctx) => json(await removeAudience(manualDir(ctx), ctx.params.name ?? "")),
  },
];
