import {
  addPage,
  listTrash,
  movePage,
  type PageStatus,
  readPage,
  removePage,
  restorePage,
  updatePage,
} from "../../core/index.js";
import { json, readJson } from "../http.js";
import type { Route } from "../router.js";
import { manualDir, optionalNumber, optionalString } from "../workspace.js";

const PAGE = "/api/manuals/:slug/pages/:id";

export const pageRoutes: Route[] = [
  {
    method: "POST",
    path: "/api/manuals/:slug/pages",
    handle: async (ctx) => {
      const body = await readJson(ctx.req);
      const text = optionalString(body.body);
      const index = optionalNumber(body.index);
      const page = await addPage(manualDir(ctx), {
        title: optionalString(body.title) ?? "",
        parentId: optionalString(body.parentId) ?? null,
        ...(text === undefined ? {} : { body: text }),
        ...(index === undefined ? {} : { index }),
      });
      return json(page, 201);
    },
  },
  {
    method: "GET",
    path: PAGE,
    handle: async (ctx) => json(await readPage(manualDir(ctx), ctx.params.id ?? "")),
  },
  {
    method: "PUT",
    path: PAGE,
    handle: async (ctx) => {
      const body = await readJson(ctx.req);
      const title = optionalString(body.title);
      const text = optionalString(body.body);
      const status = optionalString(body.status) as PageStatus | undefined;
      const patch = {
        ...(title === undefined ? {} : { title }),
        ...(text === undefined ? {} : { body: text }),
        ...(status === undefined ? {} : { status }),
      };
      return json(await updatePage(manualDir(ctx), ctx.params.id ?? "", patch));
    },
  },
  {
    method: "DELETE",
    path: PAGE,
    handle: async (ctx) => {
      // O trashId permite desfazer: POST /api/manuals/:slug/trash/:trashId/restore
      return json(await removePage(manualDir(ctx), ctx.params.id ?? ""));
    },
  },
  {
    method: "POST",
    path: `${PAGE}/move`,
    handle: async (ctx) => {
      const body = await readJson(ctx.req);
      await movePage(manualDir(ctx), ctx.params.id ?? "", {
        parentId: optionalString(body.parentId) ?? null,
        index: optionalNumber(body.index) ?? 0,
      });
      return json({ ok: true });
    },
  },
  {
    method: "GET",
    path: "/api/manuals/:slug/trash",
    handle: async (ctx) => json(await listTrash(manualDir(ctx))),
  },
  {
    method: "POST",
    path: "/api/manuals/:slug/trash/:trashId/restore",
    handle: async (ctx) => {
      await restorePage(manualDir(ctx), ctx.params.trashId ?? "");
      return json({ ok: true });
    },
  },
];
