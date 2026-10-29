import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { joinFrontmatter, splitFrontmatter } from "./frontmatter.js";
import { atomicWrite, exists, resolveInside, uniquePath } from "./fs.js";
import { readManual, updateManual } from "./manuals.js";
import { readPage, updatePage } from "./pages.js";
import { findNode } from "./tree.js";
import type { Page } from "./types.js";

/** Versões guardadas de cada página: `.versoes/<id da página>/<data>.md`, uma cópia completa por versão. */
export const VERSIONS_DIR = ".versoes";

export interface VersionInfo {
  id: string;
  title: string;
  /** Nome que a pessoa deu ao guardar ("Revisado pelo suporte"). Pode ser vazio. */
  note: string;
  savedAt: string;
  /** É a versão escolhida para o manual final. */
  published: boolean;
}

export interface Version extends VersionInfo {
  body: string;
}

const pageVersionsDir = (dir: string, pageId: string) => resolveInside(dir, path.posix.join(VERSIONS_DIR, pageId));
const versionFile = (dir: string, pageId: string, versionId: string) =>
  resolveInside(pageVersionsDir(dir, pageId), `${versionId}.md`);

/** Guarda o texto atual da página como uma versão nova. */
export async function saveVersion(dir: string, pageId: string, note = ""): Promise<VersionInfo> {
  const page = await readPage(dir, pageId);
  const savedAt = new Date().toISOString();
  const folder = pageVersionsDir(dir, pageId);
  await mkdir(folder, { recursive: true });
  // A data vira o nome do arquivo: a pasta fica em ordem e legível sem o Studio.
  const file = await uniquePath(folder, savedAt.replace(/[:.]/g, "-"), ".md");
  const clean = note.trim().slice(0, 200);
  await atomicWrite(file, joinFrontmatter({ id: page.id, title: page.title, savedAt, note: clean }, page.body));
  return { id: path.basename(file, ".md"), title: page.title, note: clean, savedAt, published: false };
}

/** Versões da página, da mais recente para a mais antiga. */
export async function listVersions(dir: string, pageId: string): Promise<VersionInfo[]> {
  const { node } = findNode((await readManual(dir)).pages, pageId);
  const folder = pageVersionsDir(dir, pageId);
  if (!(await exists(folder))) return [];
  const list: VersionInfo[] = [];
  for (const name of await readdir(folder)) {
    if (!name.endsWith(".md")) continue;
    const { body: _, ...info } = await readVersionFile(path.join(folder, name), node.published);
    list.push(info);
  }
  return list.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function readVersion(dir: string, pageId: string, versionId: string): Promise<Version> {
  const { node } = findNode((await readManual(dir)).pages, pageId);
  return readVersionFile(versionFile(dir, pageId, versionId), node.published);
}

/**
 * Volta a página para o texto da versão. O texto que estava antes vira uma versão
 * ("Antes de restaurar"), para restaurar nunca apagar nada.
 */
export async function restoreVersion(dir: string, pageId: string, versionId: string): Promise<Page> {
  const version = await readVersion(dir, pageId, versionId);
  const current = await readPage(dir, pageId);
  if (current.title !== version.title || current.body !== version.body) {
    await saveVersion(dir, pageId, "Antes de restaurar");
  }
  return updatePage(dir, pageId, { title: version.title, body: version.body });
}

/** Escolhe a versão que vai para o manual final. `null` volta a valer o texto atual da página. */
export async function publishVersion(dir: string, pageId: string, versionId: string | null): Promise<void> {
  if (versionId !== null) await readVersion(dir, pageId, versionId);
  await updateManual(dir, (meta) => {
    const { node } = findNode(meta.pages, pageId);
    if (versionId === null) delete node.published;
    else node.published = versionId;
  });
}

async function readVersionFile(file: string, published: string | undefined): Promise<Version> {
  let text: string;
  try {
    text = await readFile(file, "utf8");
  } catch (err) {
    if ((err as { code?: string }).code === "ENOENT") throw new Error(`Versão não encontrada: ${path.basename(file, ".md")}`);
    throw err;
  }
  const { data, body } = splitFrontmatter(text);
  const id = path.basename(file, ".md");
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  return { id, title: str(data.title), note: str(data.note), savedAt: str(data.savedAt), published: id === published, body };
}
