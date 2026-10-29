import { EXPORT_FORMATS, type ExportFormat, exportManual, setManualTheme } from "../../core/index.js";
import { HttpError, json, readJson } from "../http.js";
import type { Route } from "../router.js";
import { manualDir, optionalString } from "../workspace.js";

export const exportRoutes: Route[] = [
  {
    // { format: "html" | "pdf" | "markdown" }. Devolve o arquivo gerado e o endereço para abrir no navegador.
    method: "POST",
    path: "/api/manuals/:slug/export",
    handle: async (ctx) => {
      const format = optionalString((await readJson(ctx.req)).format) as ExportFormat | undefined;
      if (!format || !EXPORT_FORMATS.includes(format)) {
        throw new HttpError(400, `Formato de exportação inválido. Use ${EXPORT_FORMATS.join(", ")}.`);
      }
      const result = await exportManual(manualDir(ctx), format);
      return json({ ...result, url: `/files/${encodeURIComponent(ctx.params.slug ?? "")}/${result.file}` });
    },
  },
  {
    // { accent: "#2b4fe0" } escolhe a cor do manual exportado; { accent: null } volta à da marca.
    method: "PUT",
    path: "/api/manuals/:slug/theme",
    handle: async (ctx) => {
      const body = await readJson(ctx.req);
      const accent = body.accent === null ? undefined : optionalString(body.accent);
      if (accent === undefined && body.accent !== null) throw new HttpError(400, "Informe accent (texto ou null).");
      await setManualTheme(manualDir(ctx), accent ? { accent } : {});
      return json({ ok: true });
    },
  },
];
