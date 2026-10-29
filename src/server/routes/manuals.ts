import path from "node:path";
import { createManual, listManuals, type Manual, type PageNode, readManual, readPage } from "../../core/index.js";
import { json, readJson } from "../http.js";
import type { Route } from "../router.js";
import { manualDir, optionalString } from "../workspace.js";

interface PageTreeItem {
  id: string;
  title: string;
  /** Caminho do Markdown, usado para links entre páginas (./arquivo.md). */
  file: string;
  children: PageTreeItem[];
}

const summary = (m: Manual) => ({ slug: path.basename(m.dir), title: m.meta.title, language: m.meta.language });

/** A árvore do manual.json com o título de cada página, que fica no frontmatter. */
async function withTitles(dir: string, nodes: PageNode[]): Promise<PageTreeItem[]> {
  return Promise.all(
    nodes.map(async (n) => ({
      id: n.id,
      title: (await readPage(dir, n.id)).title,
      file: n.file,
      children: await withTitles(dir, n.children),
    })),
  );
}

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
        pages: await withTitles(dir, meta.pages),
      });
    },
  },
];
