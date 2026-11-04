import { randomUUID } from "node:crypto";
import { mkdir, readdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { emptyAnnotations, parseAnnotations } from "./annotations.js";
import { ExplicaiError } from "./errors.js";
import { atomicWrite, exists, readText, relativePosix, resolveInside, uniquePath } from "./fs.js";
import { ASSETS_DIR, inQueue, readManual } from "./manuals.js";
import { decodeUri, slugify } from "./text.js";
import type { Annotations, HotspotTarget, Point, Rect } from "./types.js";

const IMAGE_EXT = /^\.(png|jpe?g|gif|webp|svg)$/;

/** Grava a imagem em `assets/` com nome único e devolve o caminho relativo ao manual. */
export async function saveAsset(dir: string, fileName: string, data: Uint8Array): Promise<string> {
  await readManual(dir); // formato mais novo: recusa antes de gravar
  const ext = path.extname(fileName).toLowerCase();
  if (!IMAGE_EXT.test(ext)) throw new Error(`Formato de imagem não suportado: ${ext || "sem extensão"}`);
  const base = slugify(path.basename(fileName).slice(0, -ext.length));
  // Dois envios do mesmo nome ao mesmo tempo (duas abas) escolhem o mesmo caminho livre; quem perde tenta o próximo.
  for (;;) {
    const abs = await uniquePath(path.join(dir, ASSETS_DIR), base, ext);
    try {
      await writeFile(abs, data, { flag: "wx" });
      return relativePosix(dir, abs);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
    }
  }
}

export async function readAnnotations(dir: string, assetPath: string): Promise<Annotations> {
  const file = annotationsFile(dir, assetPath);
  if (!(await exists(file))) return emptyAnnotations();
  const raw = await readText(file);
  try {
    return parseAnnotations(JSON.parse(raw));
  } catch {
    // JSON quebrado ou de forma errada: o mesmo aviso
    const name = relativePosix(dir, file);
    throw new ExplicaiError(
      "annotations-invalid",
      `As marcações de ${name} estão com erro de sintaxe. Corrija ou apague o arquivo.`,
      { file: name },
    );
  }
}

export async function writeAnnotations(dir: string, assetPath: string, input: unknown): Promise<Annotations> {
  await readManual(dir); // também protege appendAnnotations, que grava por aqui
  const annotations = parseAnnotations(input);
  await atomicWrite(annotationsFile(dir, assetPath), `${JSON.stringify(annotations, null, 2)}\n`);
  return annotations;
}

/** O que o agente acrescenta; `id` e `n` são do core. Coordenadas de 0 a 1. */
export interface AnnotationsPatch {
  markers?: (Point & { label?: string })[];
  highlights?: Rect[];
  arrows?: { from: Point; to: Point }[];
  hotspots?: (Rect & { target: HotspotTarget })[];
}

/** Acrescenta marcações às que já existem, atribui `id` e `n` e valida tudo com `parseAnnotations`. */
export function appendAnnotations(dir: string, assetPath: string, patch: AnnotationsPatch): Promise<Annotations> {
  return inQueue(dir, async () => {
    const cur = await readAnnotations(dir, assetPath);
    let n = cur.markers.reduce((max, m) => Math.max(max, m.n), 0);
    const withId = <T extends object>(items: T[] | undefined) => (items ?? []).map((i) => ({ ...i, id: randomUUID() }));
    return writeAnnotations(dir, assetPath, {
      ...cur,
      markers: [...cur.markers, ...withId(patch.markers).map((m) => ({ ...m, n: ++n }))],
      highlights: [...cur.highlights, ...withId(patch.highlights)],
      arrows: [...cur.arrows, ...withId(patch.arrows)],
      hotspots: [...cur.hotspots, ...withId(patch.hotspots)],
    });
  });
}

/** Caminho absoluto de uma imagem que está direto em assets/; qualquer outro lugar é recusado. */
export function assetFile(dir: string, assetPath: string): string {
  const abs = resolveInside(dir, assetPath);
  if (path.dirname(abs) !== path.join(path.resolve(dir), ASSETS_DIR)) {
    throw new Error("Anotações só existem para imagens em assets/.");
  }
  return abs;
}

/** `assets/foto.png` → `assets/foto.png.json`. Só imagens dentro de assets/ têm anotações. */
const annotationsFile = (dir: string, assetPath: string): string => `${assetFile(dir, assetPath)}.json`;

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
  // O logo do tema não está em nenhuma página, mas o export precisa dele.
  const logo = (await readManual(dir)).theme?.logo;
  if (logo?.startsWith(`${ASSETS_DIR}/`)) used.add(logo.slice(ASSETS_DIR.length + 1));
  for (const sub of MENTION_DIRS) {
    const root = path.join(dir, sub);
    if (!(await exists(root))) continue;
    for (const file of await readdir(root, { recursive: true })) {
      if (!file.endsWith(".md")) continue;
      for (const [, name] of (await readText(path.join(root, file))).matchAll(MENTION)) {
        if (name) used.add(decodeUri(name));
      }
    }
  }
  const listed = await readdir(assetsDir);
  const names = new Set(listed);
  // Arquivo recém-gravado pode estar numa página que ainda não chegou ao disco: poupa (EXPLICAI_ASSET_GRACE_MS só para o e2e).
  const envGrace = Number(process.env.EXPLICAI_ASSET_GRACE_MS ?? 60_000);
  const grace = Number.isFinite(envGrace) && envGrace >= 0 ? envGrace : 60_000;
  const stats = await Promise.all(
    listed.map((f) =>
      stat(path.join(assetsDir, f)).catch((err) => {
        if ((err as { code?: string }).code !== "ENOENT") throw err;
        return null; // sumiu desde a listagem
      }),
    ),
  );
  const files = listed.filter((_, i) => stats[i]);
  // grace 0 desliga a poupança: mtimeMs tem fração e Date.now() é inteiro, então "agora - mtime < 0" daria verdadeiro para arquivo recém-gravado.
  const recent = new Set(listed.filter((_, i) => grace > 0 && stats[i] && Date.now() - stats[i].mtimeMs < grace));
  return files
    .filter((f) => !recent.has(f))
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
