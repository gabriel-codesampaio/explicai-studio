import { EXPORT_FORMATS, type ExportFormat, exportManual, setManualTheme } from "../../core/index.js";
import { HttpError, json, readJson } from "../http.js";
import type { Route } from "../router.js";
import { manualDir, optionalString } from "../workspace.js";

export const exportRoutes: Route[] = [
  {
    // { format: "html" | "pdf" | "markdown", onlyApproved?: true }. Devolve o arquivo gerado e o endereço para abrir no navegador.
    method: "POST",
    path: "/api/manuals/:slug/export",
    handle: async (ctx) => {
      const body = await readJson(ctx.req);
      const format = optionalString(body.format) as ExportFormat | undefined;
      if (!format || !EXPORT_FORMATS.includes(format)) {
        throw new HttpError(400, `Formato de exportação inválido. Use ${EXPORT_FORMATS.join(", ")}.`);
      }
      const result = await exportManual(manualDir(ctx), format, { onlyApproved: body.onlyApproved === true });
      return json({ ...result, url: `/files/${encodeURIComponent(ctx.params.slug ?? "")}/${result.file}` });
    },
  },
  {
    // Muda só os campos enviados: { accent?, text?, highlight?, headings?: { cover?, page?, h1?, h2?, h3? } },
    // cada um em hexadecimal ou null para voltar à cor da marca. O core confere formato e contraste (400).
    method: "PUT",
    path: "/api/manuals/:slug/theme",
    handle: async (ctx) => {
      await setManualTheme(manualDir(ctx), await readJson(ctx.req));
      return json({ ok: true });
    },
  },
];
