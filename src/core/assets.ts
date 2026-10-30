import { mkdir, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { emptyAnnotations, parseAnnotations } from "./annotations.js";
import { atomicWrite, exists, readText, relativePosix, resolveInside, uniquePath } from "./fs.js";
import { ASSETS_DIR } from "./manuals.js";
import { decodeUri, slugify } from "./text.js";
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
  return parseAnnotations(JSON.parse(await readText(file)));
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

/** Pastas cujos Markdown podem citar imagens: páginas, versões guardadas e lixeira. */
const MENTION_DIRS = ["pages", ".versoes", ".lixeira"];
const MENTION = /assets\/([^)\s"'#?]+)/g;

/**
 * Arquivos de assets/ que ninguém usa: imagens que nenhuma página, versão ou item da lixeira cita,
 * e marcações (.json) cuja imagem não existe mais. Devolve caminhos como `assets/tela.png`.
 */
export async function findUnusedAssets(dir: string): Promise<string[]> {
  const assetsDir = path.join(dir, ASSETS_DIR);
  if (!(await exists(assetsDir))) return [];
  const used = new Set<string>();
  for (const sub of MENTION_DIRS) {
    const root = path.join(dir, sub);
    if (!(await exists(root))) continue;
    for (const file of await readdir(root, { recursive: true })) {
      if (!file.endsWith(".md")) continue;
<<<<<<< HEAD
      for (const [, name] of (await readText(path.join(root, file))).matchAll(MENTION)) {
        if (name) used.add(decodeURI(name));
=======
      for (const [, name] of (await readFile(path.join(root, file), "utf8")).matchAll(MENTION)) {
        if (name) used.add(decodeUri(name));
>>>>>>> origin/test/t-058-testes
      }
    }
  }
  const files = await readdir(assetsDir);
  const names = new Set(files);
  return files
    .filter((f) => (f.endsWith(".json") ? !names.has(f.slice(0, -".json".length)) : !used.has(f)))
    .flatMap((f) => (!f.endsWith(".json") && names.has(`${f}.json`) ? [f, `${f}.json`] : [f]))
    .filter((f, i, all) => all.indexOf(f) === i)
    .map((f) => `${ASSETS_DIR}/${f}`);
}

/** Move o que `findUnusedAssets` achou para `.lixeira/imagens-<data>/`. Nada é apagado. */
export async function cleanUnusedAssets(dir: string): Promise<{ moved: number; folder: string | null }> {
  const unused = await findUnusedAssets(dir);
  if (unused.length === 0) return { moved: 0, folder: null };
  const folder = path.join(".lixeira", `imagens-${new Date().toISOString().replace(/[:.]/g, "-")}`);
  await mkdir(path.join(dir, folder, ASSETS_DIR), { recursive: true });
  for (const asset of unused) await rename(resolveInside(dir, asset), path.join(dir, folder, asset));
  return { moved: unused.length, folder: folder.split(path.sep).join("/") };
}
