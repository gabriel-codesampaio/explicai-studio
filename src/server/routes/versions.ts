import { listVersions, publishVersion, readVersion, restoreVersion, saveVersion } from "../../core/index.js";
import { HttpError, json, readJson } from "../http.js";
import type { Route } from "../router.js";
import { manualDir, optionalString } from "../workspace.js";

const VERSIONS = "/api/manuals/:slug/pages/:id/versions";

export const versionRoutes: Route[] = [
  {
    method: "GET",
    path: VERSIONS,
    handle: async (ctx) => json(await listVersions(manualDir(ctx), ctx.params.id ?? "")),
  },
  {
    method: "POST",
    path: VERSIONS,
    handle: async (ctx) => {
      const body = await readJson(ctx.req);
      return json(await saveVersion(manualDir(ctx), ctx.params.id ?? "", optionalString(body.note) ?? ""), 201);
    },
  },
  {
    method: "GET",
    path: `${VERSIONS}/:versionId`,
    handle: async (ctx) => json(await readVersion(manualDir(ctx), ctx.params.id ?? "", ctx.params.versionId ?? "")),
  },
  {
    method: "POST",
    path: `${VERSIONS}/:versionId/restore`,
    handle: async (ctx) => json(await restoreVersion(manualDir(ctx), ctx.params.id ?? "", ctx.params.versionId ?? "")),
  },
  {
    // { versionId: "<id>" } escolhe a versão do manual final; { versionId: null } volta ao texto atual.
    method: "PUT",
    path: "/api/manuals/:slug/pages/:id/published",
    handle: async (ctx) => {
      const body = await readJson(ctx.req);
      const versionId = body.versionId === null ? null : optionalString(body.versionId);
      if (versionId === undefined) throw new HttpError(400, "Informe versionId (texto ou null).");
      await publishVersion(manualDir(ctx), ctx.params.id ?? "", versionId);
      return json({ ok: true });
    },
  },
];
