import { resolveInside } from "../core/index.js";
import { HttpError } from "./http.js";
import type { RouteContext } from "./router.js";

/** Pasta do manual `:slug` dentro do workspace. Recusa nomes que tentem sair da pasta. */
export function manualDir({ opts, params }: RouteContext): string {
  const slug = params.slug ?? "";
  if (!slug || slug.includes("/") || slug.includes("\\") || slug.startsWith(".")) {
    throw new HttpError(404, "Manual não encontrado.");
  }
  return resolveInside(opts.workspace, slug);
}

export function optionalString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

export function optionalNumber(v: unknown): number | undefined {
  return typeof v === "number" ? v : undefined;
}
