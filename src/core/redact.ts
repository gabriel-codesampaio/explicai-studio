import { randomUUID } from "node:crypto";
import { readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { assetFile } from "./assets.js";
import { ExplicaiError } from "./errors.js";
import { imageSize } from "./export/imageSize.js";
import { exists } from "./fs.js";
import { ASSETS_DIR } from "./manuals.js";

const FORMATS: Record<string, "png" | "jpeg" | "webp"> = { ".png": "png", ".jpg": "jpeg", ".jpeg": "jpeg", ".webp": "webp" };
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
/** Blocos do PNG que carregam metadados (EXIF e texto): não entram no arquivo tarjado. */
const PNG_METADATA = new Set(["eXIf", "tEXt", "zTXt", "iTXt"]);

const invalid = (why: string) => new ExplicaiError("redact-invalid", `A imagem tarjada não pôde ser gravada: ${why}.`, { why });

/** PNG sem metadados e sem nenhum byte depois do IEND (o erro do aCropalypse). */
function cleanPng(b: Buffer): Buffer {
  if (!b.subarray(0, 8).equals(PNG_SIGNATURE)) throw invalid("o conteúdo não é um PNG");
  const kept: Buffer[] = [PNG_SIGNATURE];
  for (let i = 8; i + 12 <= b.length; ) {
    const end = i + 12 + b.readUInt32BE(i);
    if (end > b.length) break;
    const type = b.toString("ascii", i + 4, i + 8);
    if (!PNG_METADATA.has(type)) kept.push(b.subarray(i, end));
    if (type === "IEND") return Buffer.concat(kept);
    i = end;
  }
  throw invalid("o PNG está incompleto");
}

// shortcut: JPEG e WebP vêm do canvas do navegador, que não grava EXIF; aqui só recusa o que trouxer.
// Quando outro cliente puder enviar, troque a recusa por limpeza dos segmentos APP1/EXIF.
function cleanJpeg(b: Buffer): Buffer {
  const end = b.lastIndexOf(Buffer.from([0xff, 0xd9]));
  if (b[0] !== 0xff || b[1] !== 0xd8 || end < 0) throw invalid("o conteúdo não é um JPEG");
  const clean = b.subarray(0, end + 2);
  if (clean.includes("Exif\0\0", 0, "latin1")) throw invalid("o arquivo traz EXIF");
  return clean;
}

function cleanWebp(b: Buffer): Buffer {
  if (b.length < 12 || b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") {
    throw invalid("o conteúdo não é um WebP");
  }
  const total = b.readUInt32LE(4) + 8;
  if (total > b.length) throw invalid("o WebP está incompleto");
  const clean = b.subarray(0, total);
  if (clean.includes("EXIF", 12, "latin1")) throw invalid("o arquivo traz EXIF");
  return clean;
}

/**
 * Troca o arquivo de `assets/` pela versão com as tarjas já queimadas (o navegador desenha e envia).
 * Valida o formato e o tamanho em pixels, grava num temporário e renomeia por cima do caminho de sempre,
 * então Markdown e marcações seguem valendo. O original não vai para a lixeira: some, junto com
 * qualquer cópia idêntica dele na pasta de imagens sem uso.
 */
export async function redactAsset(dir: string, assetPath: string, data: Uint8Array): Promise<void> {
  const target = assetFile(dir, assetPath);
  const format = FORMATS[path.extname(target).toLowerCase()];
  if (!format) throw new ExplicaiError("redact-type", "Só dá para ocultar dados em PNG, JPEG ou WebP.");
  if (!(await exists(target)))
    throw new ExplicaiError("redact-missing", `A imagem ${assetPath} não existe.`, { asset: assetPath });
  const original = await readFile(target);
  const before = await imageSize(target);
  const clean = { png: cleanPng, jpeg: cleanJpeg, webp: cleanWebp }[format](Buffer.from(data));
  const tmp = `${target}.${randomUUID()}.tmp`;
  try {
    await writeFile(tmp, clean);
    const after = await imageSize(tmp);
    if (!before || after?.w !== before.w || after.h !== before.h) throw invalid("o tamanho em pixels mudou");
    await rename(tmp, target);
  } finally {
    await rm(tmp, { force: true });
  }
  await dropTrashedCopies(dir, path.basename(target), original);
}

/** Cópias idênticas ao original em `.lixeira/imagens-*` (imagens sem uso) também são apagadas. */
async function dropTrashedCopies(dir: string, name: string, original: Buffer): Promise<void> {
  const trash = path.join(dir, ".lixeira");
  if (!(await exists(trash))) return;
  for (const folder of await readdir(trash)) {
    const copy = path.join(trash, folder, ASSETS_DIR, name);
    if (
      folder.startsWith("imagens-") &&
      (await stat(copy).catch(() => null))?.isFile() &&
      (await readFile(copy)).equals(original)
    ) {
      await rm(copy);
    }
  }
}

/** A pasta do manual está dentro de um repositório git? Procura `.git` na pasta e nas de cima. */
export async function insideGitRepo(dir: string): Promise<boolean> {
  for (let cur = path.resolve(dir); ; cur = path.dirname(cur)) {
    if (await exists(path.join(cur, ".git"))) return true;
    if (path.dirname(cur) === cur) return false;
  }
}
