import {
  cleanUnusedAssets,
  findUnusedAssets,
  readAnnotations,
  resolveInside,
  saveAsset,
  writeAnnotations,
} from "../../core/index.js";
import { file, json, readBody, readJson } from "../http.js";
import type { Route } from "../router.js";
import { manualDir } from "../workspace.js";

const MAX_UPLOAD = 20 * 1024 * 1024;

export const assetRoutes: Route[] = [
  {
    method: "POST",
    path: "/api/manuals/:slug/assets",
    handle: async (ctx) => {
      const name = ctx.url.searchParams.get("name") ?? "imagem.png";
      const data = await readBody(ctx.req, MAX_UPLOAD);
      return json({ path: await saveAsset(manualDir(ctx), name, data) }, 201);
    },
  },
  {
    method: "GET",
    path: "/api/manuals/:slug/annotations",
    handle: async (ctx) => json(await readAnnotations(manualDir(ctx), ctx.url.searchParams.get("asset") ?? "")),
  },
  {
    method: "PUT",
    path: "/api/manuals/:slug/annotations",
    handle: async (ctx) =>
      json(await writeAnnotations(manualDir(ctx), ctx.url.searchParams.get("asset") ?? "", await readJson(ctx.req))),
  },
  {
    // Imagens e marcações que nenhuma página, versão ou item da lixeira usa.
    method: "GET",
    path: "/api/manuals/:slug/assets/unused",
    handle: async (ctx) => json({ count: (await findUnusedAssets(manualDir(ctx))).length }),
  },
  {
    // Move as sem uso para .lixeira/imagens-<data>/. Nada é apagado.
    method: "POST",
    path: "/api/manuals/:slug/assets/clean",
    handle: async (ctx) => json(await cleanUnusedAssets(manualDir(ctx))),
  },
  {
    // Imagens do manual, usadas pelo editor: /files/<manual>/assets/<arquivo>
    method: "GET",
    path: "/files/:slug/*",
    handle: (ctx) => file(resolveInside(manualDir(ctx), ctx.rest)),
  },
];
