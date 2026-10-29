import path from "node:path";
import { createManual, listManuals, type Manual, readManual, readPageTree } from "../../core/index.js";
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
    method: "GET",
    path: "/api/manuals/:slug",
    handle: async (ctx) => {
      const dir = manualDir(ctx);
      const meta = await readManual(dir);
      return json({
        slug: ctx.params.slug,
        title: meta.title,
        language: meta.language,
        theme: meta.theme ?? {},
        pages: await readPageTree(dir),
      });
    },
  },
];
