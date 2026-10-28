import type { IncomingMessage } from "node:http";
import type { Reply } from "./http.js";

export interface StudioOptions {
  /** Pasta onde ficam os manuais. */
  workspace: string;
  /** Pasta com o build do editor (index.html e assets). Sem ela, só a API responde. */
  webDir?: string;
}

export interface RouteContext {
  req: IncomingMessage;
  url: URL;
  /** Segmentos `:nome` do padrão da rota, já decodificados. */
  params: Record<string, string>;
  /** O que veio depois de um `*` no fim do padrão. */
  rest: string;
  opts: StudioOptions;
}

export interface Route {
  method: string;
  /** Ex.: `/api/manuals/:slug/pages/:id`. Um `*` no fim aceita o resto do caminho. */
  path: string;
  handle: (ctx: RouteContext) => Promise<Reply> | Reply;
}

export type Match = { route: Route; params: Record<string, string>; rest: string };

/** Primeira rota cujo método e padrão batem. A ordem da tabela define a prioridade. */
export function matchRoute(routes: Route[], method: string, segments: string[]): Match | null {
  for (const route of routes) {
    if (route.method !== method) continue;
    const match = matchPath(route.path, segments);
    if (match) return { route, ...match };
  }
  return null;
}

function matchPath(pattern: string, segments: string[]): { params: Record<string, string>; rest: string } | null {
  const parts = pattern.split("/").filter(Boolean);
  const params: Record<string, string> = {};
  for (const [i, part] of parts.entries()) {
    if (part === "*") return { params, rest: segments.slice(i).join("/") };
    const seg = segments[i];
    if (seg === undefined) return null;
    if (part.startsWith(":")) params[part.slice(1)] = seg;
    else if (part !== seg) return null;
  }
  return parts.length === segments.length ? { params, rest: "" } : null;
}
