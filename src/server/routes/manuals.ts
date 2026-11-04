import path from "node:path";
import {
  createManual,
  FORMAT_VERSION,
  listManuals,
  type Manual,
  readManual,
  readPageTree,
  renameManual,
} from "../../core/index.js";
import { json, readJson } from "../http.js";
import type { Route } from "../router.js";
import { manualDir, optionalString } from "../workspace.js";

const summary = (m: Manual) => ({ slug: path.basename(m.dir), title: m.meta.title, language: m.meta.language });

export const manualRoutes: Route[] = [
  {
    method: "GET",
    path: "/api/manuals",
    handle: async ({ opts }) => json((await listManuals(opts.workspace)).map(summary)),
  },
  {
    method: "POST",
    path: "/api/manuals",
    handle: async ({ opts, req }) => {
      const body = await readJson(req);
      const manual = await createManual(opts.workspace, {
        title: optionalString(body.title) ?? "",
        language: optionalString(body.language) ?? "pt-BR",
      });
      return json(summary(manual), 201);
    },
  },
  {
    method: "PUT",
    path: "/api/manuals/:slug",
    handle: async (ctx) => {
      const dir = manualDir(ctx);
      const body = await readJson(ctx.req);
      await readManual(dir); // manual inexistente: 404 antes de validar o título
      return json({ slug: ctx.params.slug, title: await renameManual(dir, optionalString(body.title) ?? "") });
    },
  },
  {
    method: "GET",
    path: "/api/manuals/:slug",
    handle: async (ctx) => {
      const dir = manualDir(ctx);
      const meta = await readManual(dir, { allowNewer: true });
      return json({
        // Formato mais novo que o do Studio: a interface abre só para leitura (as gravações voltam 409).
        ...(meta.version > FORMAT_VERSION ? { newerFormat: meta.version } : {}),
        slug: ctx.params.slug,
        title: meta.title,
        language: meta.language,
        theme: meta.theme ?? {},
        cover: meta.cover ?? {},
        footer: meta.footer ?? {},
        audiences: meta.audiences ?? [],
        pages: await readPageTree(dir, { allowNewer: true }),
      });
    },
  },
];
