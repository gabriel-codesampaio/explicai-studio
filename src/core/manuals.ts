import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { atomicWrite, exists, uniquePath } from "./fs.js";
import { required, slugify } from "./text.js";
import { FORMAT_VERSION, type Manual, type ManualMeta } from "./types.js";

const META_FILE = "manual.json";
export const PAGES_DIR = "pages";
export const ASSETS_DIR = "assets";

export async function createManual(workspace: string, opts: { title: string; language: string }): Promise<Manual> {
  const title = required(opts.title, "título do manual");
  const dir = await uniquePath(workspace, slugify(title), "");
  const meta: ManualMeta = { version: FORMAT_VERSION, title, language: opts.language, pages: [] };
  await mkdir(path.join(dir, PAGES_DIR), { recursive: true });
  await mkdir(path.join(dir, ASSETS_DIR), { recursive: true });
  await writeManual(dir, meta);
  return { dir, meta };
}

/** Manuais são as subpastas diretas do workspace que têm manual.json. */
export async function listManuals(workspace: string): Promise<Manual[]> {
  const entries = await readdir(workspace, { withFileTypes: true });
  const manuals: Manual[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const dir = path.join(workspace, e.name);
    if (await exists(path.join(dir, META_FILE))) manuals.push({ dir, meta: await readManual(dir) });
  }
  return manuals.sort((a, b) => a.meta.title.localeCompare(b.meta.title));
}

export async function readManual(dir: string): Promise<ManualMeta> {
  const meta = JSON.parse(await readFile(path.join(dir, META_FILE), "utf8")) as Partial<ManualMeta> | null;
  if (meta?.version !== FORMAT_VERSION) {
    throw new Error(`${META_FILE}: versão de formato não suportada (${String(meta?.version)})`);
  }
  return meta as ManualMeta;
}

export async function writeManual(dir: string, meta: ManualMeta): Promise<void> {
  await atomicWrite(path.join(dir, META_FILE), `${JSON.stringify(meta, null, 2)}\n`);
}

/** Lê o manual, aplica a mudança e grava de volta. Concentra o ciclo ler-alterar-gravar da árvore. */
export async function updateManual<T>(dir: string, change: (meta: ManualMeta) => T): Promise<T> {
  const meta = await readManual(dir);
  const result = change(meta);
  await writeManual(dir, meta);
  return result;
}
