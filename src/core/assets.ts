import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { emptyAnnotations, parseAnnotations } from "./annotations.js";
import { atomicWrite, exists, relativePosix, resolveInside, uniquePath } from "./fs.js";
import { ASSETS_DIR } from "./manuals.js";
import { slugify } from "./text.js";
import type { Annotations } from "./types.js";

const IMAGE_EXT = /^\.(png|jpe?g|gif|webp|svg)$/;

/** Grava a imagem em `assets/` com nome único e devolve o caminho relativo ao manual. */
export async function saveAsset(dir: string, fileName: string, data: Uint8Array): Promise<string> {
  const ext = path.extname(fileName).toLowerCase();
  if (!IMAGE_EXT.test(ext)) throw new Error(`Formato de imagem não suportado: ${ext || "sem extensão"}`);
  const name = path.basename(fileName);
  const abs = await uniquePath(path.join(dir, ASSETS_DIR), slugify(name.slice(0, name.length - ext.length)), ext);
  await writeFile(abs, data, { flag: "wx" });
  return relativePosix(dir, abs);
}

export async function readAnnotations(dir: string, assetPath: string): Promise<Annotations> {
  const file = annotationsFile(dir, assetPath);
  if (!(await exists(file))) return emptyAnnotations();
  return parseAnnotations(JSON.parse(await readFile(file, "utf8")));
}

export async function writeAnnotations(dir: string, assetPath: string, input: unknown): Promise<Annotations> {
  const annotations = parseAnnotations(input);
  await atomicWrite(annotationsFile(dir, assetPath), `${JSON.stringify(annotations, null, 2)}\n`);
  return annotations;
}

/** `assets/foto.png` → `assets/foto.png.json`. Só imagens dentro de assets/ têm anotações. */
function annotationsFile(dir: string, assetPath: string): string {
  const abs = resolveInside(dir, assetPath);
  if (path.dirname(abs) !== path.join(path.resolve(dir), ASSETS_DIR)) {
    throw new Error("Anotações só existem para imagens em assets/.");
  }
  return `${abs}.json`;
}
