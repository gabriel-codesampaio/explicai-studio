import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { ExplicaiError } from "../core/errors.js";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Identifica o erro para a interface traduzir (a mensagem fica em português para curl e MCP). */
    readonly code?: string,
  ) {
    super(message);
  }
}

/** O que um handler devolve. O servidor transforma em resposta HTTP. */
export type Reply =
  | { kind: "json"; status: number; body: unknown }
  | { kind: "file"; path: string; cache: string; untrusted: boolean };

export const json = (body: unknown, status = 200): Reply => ({ kind: "json", status, body });
/** `untrusted`: arquivo do manual (/files/), que pode ser um SVG com script; sai com CSP e sandbox. */
export const file = (filePath: string, cache = "no-cache", untrusted = false): Reply => ({
  kind: "file",
  path: filePath,
  cache,
  untrusted,
});

const RASTER = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"]);
const UNTRUSTED_CSP = "default-src 'none'; style-src 'unsafe-inline'; sandbox";

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
  ".pdf": "application/pdf",
  ".md": "text/markdown; charset=utf-8",
};

export async function send(res: ServerResponse, reply: Reply, req?: IncomingMessage): Promise<void> {
  if (reply.kind === "json") return sendJson(res, reply.status, reply.body);
  const info = await stat(reply.path); // ENOENT vira 404 no chamador, antes de qualquer cabeçalho
  if (!info.isFile()) throw new HttpError(404, "Arquivo não encontrado.");
  const ext = path.extname(reply.path).toLowerCase();
  // ETag fraco por tamanho e mtime: barato, sem ler o arquivo.
  const etag = `W/"${info.size.toString(16)}-${Math.floor(info.mtimeMs).toString(16)}"`;
  const headers = {
    etag,
    "cache-control": reply.cache,
    "x-content-type-options": "nosniff",
    ...(reply.untrusted && !RASTER.has(ext) ? { "content-security-policy": UNTRUSTED_CSP } : {}),
  };
  // shortcut: só um valor em If-None-Match (o do próprio navegador), sem lista nem "*"; Range/HEAD não tratados.
  if (req?.headers["if-none-match"] === etag) {
    res.writeHead(304, headers);
    res.end();
    return;
  }
  res.writeHead(200, { "content-type": MIME[ext] ?? "application/octet-stream", "content-length": info.size, ...headers });
  // Erro no meio do envio ou cliente que abortou: o pipeline destrói os dois lados; os cabeçalhos já saíram.
  await pipeline(createReadStream(reply.path), res).catch(() => {});
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
    // Passou do limite: continua lendo sem guardar. Parar no meio derruba a conexão e o navegador
    // nunca recebe o 413. shortcut: lê o envio inteiro; tudo bem só porque o servidor é local.
    if (size <= limit) chunks.push(chunk as Buffer);
  }
  if (size > limit) throw new HttpError(413, `Arquivo maior que ${limit / 1024 / 1024} MB.`);
  return Buffer.concat(chunks);
}

export async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const raw = await readBody(req, 5 * 1024 * 1024);
  // Um POST text/plain de outro site não dispara preflight; exigir JSON fecha essa brecha. Corpo vazio não lê nada.
  if (raw.length > 0 && !/^application\/json\s*(;|$)/i.test(req.headers["content-type"] ?? "")) {
    throw new HttpError(
      415,
      "Envie o corpo como JSON, com o cabeçalho content-type: application/json.",
      "unsupported-media-type",
    );
  }
  let text: string;
  try {
    // fatal: um cliente em Latin-1/cp1252 (curl no Windows) mandaria "í" como 0xED, e o decode comum o trocaria por U+FFFD gravado em disco.
    text = new TextDecoder("utf-8", { fatal: true }).decode(raw);
  } catch {
    throw new HttpError(400, "O corpo da requisição não está em UTF-8 válido. Envie o JSON em UTF-8.", "invalid-utf8");
  }
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
  if (err instanceof ExplicaiError && err.code === "disk-conflict") return 409;
  const missing =
    (err instanceof Error && /não encontrad/i.test(err.message)) ||
    ["ENOENT", "EISDIR"].includes((err as { code?: string } | null)?.code ?? "");
  return missing ? 404 : 400;
}

const FILE_ERRORS: Record<string, string> = {
  ENOENT: "Arquivo não encontrado.",
  EISDIR: "Arquivo não encontrado.",
  EACCES: "Sem permissão para acessar o arquivo.",
  EPERM: "Sem permissão para acessar o arquivo.",
};

/** Texto do erro para a resposta: erro de arquivo do Node traz o caminho absoluto, então vira frase fixa. */
export function publicMessage(err: unknown): string {
  const fixed = FILE_ERRORS[(err as { code?: string } | null)?.code ?? ""];
  return fixed ?? (err instanceof Error ? err.message : String(err));
}
