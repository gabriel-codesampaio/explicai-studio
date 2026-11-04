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

/** Lista de perfis (`["admin"]`); `null` apaga. Outro tipo: 400. */
export function optionalAudience(v: unknown): string[] | null | undefined {
  if (v === undefined || v === null) return v;
  if (Array.isArray(v) && v.length <= 10 && v.every((x) => typeof x === "string" && x.length <= 40)) return v as string[];
  throw new HttpError(400, "audience deve ser uma lista de até 10 textos de até 40 caracteres, ou null.");
}

/** Perfil para exportar: ausente = todos; presente precisa ser texto não vazio (senão o filtro sumiria sem aviso). */
export function optionalProfile(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "string" && v.trim() && v.length <= 40) return v;
  throw new HttpError(400, "audience deve ser um texto de 1 a 40 caracteres.");
}
