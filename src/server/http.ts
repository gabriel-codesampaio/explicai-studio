import { readFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** O que um handler devolve. O servidor transforma em resposta HTTP. */
export type Reply = { kind: "json"; status: number; body: unknown } | { kind: "file"; path: string; cache: string };

export const json = (body: unknown, status = 200): Reply => ({ kind: "json", status, body });
export const file = (filePath: string, cache = "no-cache"): Reply => ({ kind: "file", path: filePath, cache });

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

export async function send(res: ServerResponse, reply: Reply): Promise<void> {
  if (reply.kind === "json") return sendJson(res, reply.status, reply.body);
  const data = await readFile(reply.path);
  res.writeHead(200, {
    "content-type": MIME[path.extname(reply.path).toLowerCase()] ?? "application/octet-stream",
    "cache-control": reply.cache,
    "x-content-type-options": "nosniff",
  });
  res.end(data);
}

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

export async function readBody(req: IncomingMessage, limit: number): Promise<Uint8Array> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > limit) throw new HttpError(413, `Arquivo maior que ${limit / 1024 / 1024} MB.`);
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
}

export async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const text = Buffer.from(await readBody(req, 5 * 1024 * 1024)).toString("utf8");
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new HttpError(400, "O corpo da requisição não é um JSON válido.");
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new HttpError(400, "O corpo da requisição deve ser um objeto JSON.");
  }
  return data as Record<string, unknown>;
}

/** Status HTTP para um erro vindo do core: "não encontrado" e arquivo inexistente viram 404, o resto 400. */
export function statusOf(err: unknown): number {
  if (err instanceof HttpError) return err.status;
  const missing =
    (err instanceof Error && /não encontrad/i.test(err.message)) ||
    (typeof err === "object" && err !== null && (err as { code?: string }).code === "ENOENT");
  return missing ? 404 : 400;
}
