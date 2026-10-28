import { readFile, stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import path from "node:path";
import {
  addPage,
  createManual,
  listManuals,
  movePage,
  readAnnotations,
  readManual,
  readPage,
  removePage,
  resolveInside,
  saveAsset,
  updatePage,
  writeAnnotations,
  type PageNode,
} from "../core/index.js";

export interface StudioOptions {
  /** Pasta onde ficam os manuais. */
  workspace: string;
  /** Pasta com o build do editor (index.html e assets). Sem ela, só a API responde. */
  webDir?: string;
}

const MAX_UPLOAD = 20 * 1024 * 1024;

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function createStudioServer(opts: StudioOptions): Server {
  return createServer((req, res) => {
    handle(opts, req, res).catch((err: unknown) => {
      const status = err instanceof HttpError ? err.status : notFound(err) ? 404 : 400;
      sendJson(res, status, { error: err instanceof Error ? err.message : String(err) });
    });
  });
}

async function handle(opts: StudioOptions, req: IncomingMessage, res: ServerResponse): Promise<void> {
  guardLocal(req);
  const url = new URL(req.url ?? "/", "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  const method = req.method ?? "GET";

  if (parts[0] === "api") return api(opts, method, parts.slice(1), url, req, res);

  // Imagens do manual: /files/<manual>/assets/<arquivo>
  if (parts[0] === "files" && parts[1] && method === "GET") {
    const dir = manualDir(opts, parts[1]);
    return sendFile(res, resolveInside(dir, parts.slice(2).join("/")), "no-cache");
  }

  if (!opts.webDir || method !== "GET") throw new HttpError(404, "Não encontrado.");
  const file = resolveInside(opts.webDir, parts.join("/") || "index.html");
  const isFile = await stat(file).then((s) => s.isFile(), () => false);
  // Rotas do editor caem no index.html (aplicação de página única).
  return sendFile(res, isFile ? file : path.join(opts.webDir, "index.html"), isFile ? "max-age=3600" : "no-cache");
}

async function api(
  opts: StudioOptions,
  method: string,
  parts: string[],
  url: URL,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const [resource, slug, sub, id, action] = parts;
  if (resource !== "manuals") throw new HttpError(404, "Rota desconhecida.");

  if (!slug) {
    if (method === "GET") {
      const manuals = await listManuals(opts.workspace);
      return sendJson(res, 200, manuals.map((m) => ({ slug: path.basename(m.dir), title: m.meta.title, language: m.meta.language })));
    }
    if (method === "POST") {
      const body = await readJson(req);
      const manual = await createManual(opts.workspace, { title: str(body.title), language: str(body.language ?? "pt-BR") });
      return sendJson(res, 201, { slug: path.basename(manual.dir), title: manual.meta.title, language: manual.meta.language });
    }
  }

  const dir = manualDir(opts, slug ?? "");

  if (!sub && method === "GET") {
    const meta = await readManual(dir);
    return sendJson(res, 200, { slug, title: meta.title, language: meta.language, pages: await withTitles(dir, meta.pages) });
  }

  if (sub === "pages") {
    if (!id && method === "POST") {
      const body = await readJson(req);
      const page = await addPage(dir, {
        title: str(body.title),
        ...(typeof body.body === "string" ? { body: body.body } : {}),
        parentId: typeof body.parentId === "string" ? body.parentId : null,
        ...(typeof body.index === "number" ? { index: body.index } : {}),
      });
      return sendJson(res, 201, page);
    }
    if (id && !action) {
      if (method === "GET") return sendJson(res, 200, await readPage(dir, id));
      if (method === "PUT") {
        const body = await readJson(req);
        const patch = {
          ...(typeof body.title === "string" ? { title: body.title } : {}),
          ...(typeof body.body === "string" ? { body: body.body } : {}),
        };
        return sendJson(res, 200, await updatePage(dir, id, patch));
      }
      if (method === "DELETE") {
        await removePage(dir, id);
        return sendJson(res, 200, { ok: true });
      }
    }
    if (id && action === "move" && method === "POST") {
      const body = await readJson(req);
      await movePage(dir, id, {
        parentId: typeof body.parentId === "string" ? body.parentId : null,
        index: typeof body.index === "number" ? body.index : 0,
      });
      return sendJson(res, 200, { ok: true });
    }
  }

  if (sub === "assets" && !id && method === "POST") {
    const name = url.searchParams.get("name") ?? "imagem.png";
    const data = await readBody(req, MAX_UPLOAD);
    return sendJson(res, 201, { path: await saveAsset(dir, name, data) });
  }

  if (sub === "annotations") {
    const asset = url.searchParams.get("asset") ?? "";
    if (method === "GET") return sendJson(res, 200, await readAnnotations(dir, asset));
    if (method === "PUT") return sendJson(res, 200, await writeAnnotations(dir, asset, await readJson(req)));
  }

  throw new HttpError(405, "Método não suportado nesta rota.");
}

interface PageTreeItem {
  id: string;
  title: string;
  children: PageTreeItem[];
}

async function withTitles(dir: string, nodes: PageNode[]): Promise<PageTreeItem[]> {
  return Promise.all(
    nodes.map(async (n) => ({
      id: n.id,
      title: (await readPage(dir, n.id)).title,
      children: await withTitles(dir, n.children),
    })),
  );
}

/**
 * O servidor só atende o próprio computador. Checar Host e Origin impede que um site aberto
 * no navegador use o Studio (DNS rebinding e requisições de outra origem).
 */
function guardLocal(req: IncomingMessage): void {
  const host = (req.headers.host ?? "").replace(/:\d+$/, "");
  if (!["localhost", "127.0.0.1", "[::1]"].includes(host)) throw new HttpError(403, "Acesso permitido só a partir deste computador.");
  const origin = req.headers.origin;
  if (origin && !/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin)) {
    throw new HttpError(403, "Origem não permitida.");
  }
}

function manualDir(opts: StudioOptions, slug: string): string {
  if (!slug || slug.includes("/") || slug.includes("\\") || slug.startsWith(".")) throw new HttpError(404, "Manual não encontrado.");
  return resolveInside(opts.workspace, slug);
}

async function readBody(req: IncomingMessage, limit: number): Promise<Uint8Array> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > limit) throw new HttpError(413, `Arquivo maior que ${limit / 1024 / 1024} MB.`);
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const text = Buffer.from(await readBody(req, 5 * 1024 * 1024)).toString("utf8");
  const data: unknown = text ? JSON.parse(text) : {};
  if (typeof data !== "object" || data === null || Array.isArray(data)) throw new HttpError(400, "Corpo da requisição deve ser um objeto JSON.");
  return data as Record<string, unknown>;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

async function sendFile(res: ServerResponse, file: string, cache: string): Promise<void> {
  const data = await readFile(file);
  res.writeHead(200, {
    "content-type": MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream",
    "cache-control": cache,
    "x-content-type-options": "nosniff",
  });
  res.end(data);
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

function notFound(err: unknown): boolean {
  return (
    (err instanceof Error && /não encontrad/i.test(err.message)) ||
    (typeof err === "object" && err !== null && (err as { code?: string }).code === "ENOENT")
  );
}
