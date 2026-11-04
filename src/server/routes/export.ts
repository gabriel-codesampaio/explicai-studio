import {
  EXPORT_FORMATS,
  type ExportFormat,
  exportManual,
  logoSizeError,
  setManualLogo,
  setManualTheme,
} from "../../core/index.js";
import { HttpError, json, readBody, readJson } from "../http.js";
import type { Route } from "../router.js";
import { manualDir, optionalString } from "../workspace.js";

export const exportRoutes: Route[] = [
  {
    // { format: "html" | "pdf" | "markdown", onlyApproved?: true, audience?: string }. Devolve o arquivo gerado e o endereço para abrir no navegador.
    method: "POST",
    path: "/api/manuals/:slug/export",
    handle: async (ctx) => {
      const body = await readJson(ctx.req);
      const format = optionalString(body.format) as ExportFormat | undefined;
      if (!format || !EXPORT_FORMATS.includes(format)) {
        throw new HttpError(400, `Formato de exportação inválido. Use ${EXPORT_FORMATS.join(", ")}.`);
      }
      const result = await exportManual(manualDir(ctx), format, {
        onlyApproved: body.onlyApproved === true,
        audience: optionalString(body.audience),
      });
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
  {
    // Corpo = o arquivo do logo (PNG, JPG ou SVG, até 1 MB), nome em ?name=. Guarda em assets/ e põe no tema.
    // O limite de leitura é maior que o do logo para o core recusar com o motivo.
    method: "POST",
    path: "/api/manuals/:slug/logo",
    handle: async (ctx) => {
      const name = ctx.url.searchParams.get("name") ?? "logo.png";
      const data = await readBody(ctx.req, 2 * 1024 * 1024).catch((err: unknown) => {
        throw err instanceof HttpError && err.status === 413 ? logoSizeError() : err;
      });
      return json({ path: await setManualLogo(manualDir(ctx), name, data) }, 201);
    },
  },
];
