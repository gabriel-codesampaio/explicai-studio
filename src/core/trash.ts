import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rename, rm } from "node:fs/promises";
import path from "node:path";
import { splitFrontmatter } from "./frontmatter.js";
import { atomicWrite, exists, relativePosix, resolveInside, uniquePath } from "./fs.js";
import { PAGES_DIR, updateManual } from "./manuals.js";
import { childrenOf, clampIndex, findIn, findNode, flatten } from "./tree.js";
import type { PageNode } from "./types.js";

/** Páginas excluídas ficam aqui até serem restauradas ou apagadas à mão. */
export const TRASH_DIR = ".lixeira";

interface TrashEntry {
  node: PageNode;
  parentId: string | null;
  index: number;
  deletedAt: string;
}

export interface TrashItem {
  trashId: string;
  /** Id da página principal, para abrir de novo depois de restaurar. */
  pageId: string;
  title: string;
  /** Quantas páginas voltam ao restaurar (a página mais as subpáginas). */
  pages: number;
  deletedAt: string;
}

/** O que está na lixeira, da exclusão mais recente para a mais antiga. */
export async function listTrash(dir: string): Promise<TrashItem[]> {
  const root = path.join(dir, TRASH_DIR);
  if (!(await exists(root))) return [];
  const items: TrashItem[] = [];
  for (const trashId of await readdir(root)) {
    const entryFile = path.join(root, trashId, "entry.json");
    if (!(await exists(entryFile))) continue;
    const entry = JSON.parse(await readFile(entryFile, "utf8")) as TrashEntry;
    const pageFile = path.join(root, trashId, entry.node.file);
    const data: Record<string, unknown> = (await exists(pageFile)) ? splitFrontmatter(await readFile(pageFile, "utf8")).data : {};
    const title = typeof data.title === "string" ? data.title : "";
    items.push({ trashId, pageId: entry.node.id, title, pages: flatten([entry.node]).length, deletedAt: entry.deletedAt });
  }
  return items.sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
}

/**
 * Tira a página (e as subpáginas) da árvore e move os arquivos para a lixeira do manual.
 * Devolve o id da lixeira, usado para desfazer. Imagens ficam em assets/, porque outras páginas podem usar.
 */
export async function removePage(dir: string, id: string): Promise<{ trashId: string }> {
  const entry = await updateManual(dir, (meta): TrashEntry => {
    const { node, siblings } = findNode(meta.pages, id);
    const index = siblings.indexOf(node);
    siblings.splice(index, 1);
    return { node, parentId: parentOf(meta.pages, siblings), index, deletedAt: new Date().toISOString() };
  });

  const trashId = randomUUID();
  const trash = path.join(dir, TRASH_DIR, trashId);
  await mkdir(path.join(trash, PAGES_DIR), { recursive: true });
  for (const n of flatten([entry.node])) {
    const from = resolveInside(dir, n.file);
    if (await exists(from)) await rename(from, path.join(trash, n.file));
  }
  await atomicWrite(path.join(trash, "entry.json"), `${JSON.stringify(entry, null, 2)}\n`);
  return { trashId };
}

/**
 * Devolve a página ao lugar de onde saiu. Se o pai também foi excluído, ela volta para a raiz.
 * Se outro arquivo ocupou o nome nesse meio tempo, ela ganha um nome novo.
 */
export async function restorePage(dir: string, trashId: string): Promise<void> {
  const trash = resolveInside(path.join(dir, TRASH_DIR), trashId);
  const entry = JSON.parse(await readFile(path.join(trash, "entry.json"), "utf8")) as TrashEntry;

  for (const n of flatten([entry.node])) {
    const from = path.join(trash, n.file);
    let to = resolveInside(dir, n.file);
    if (await exists(to)) {
      to = await uniquePath(path.join(dir, PAGES_DIR), path.basename(n.file, ".md"), ".md");
      n.file = relativePosix(dir, to);
    }
    if (await exists(from)) await rename(from, to);
  }

  await updateManual(dir, (meta) => {
    const parentId = entry.parentId && findIn(meta.pages, entry.parentId) ? entry.parentId : null;
    const siblings = childrenOf(meta.pages, parentId);
    siblings.splice(clampIndex(entry.index, siblings.length), 0, entry.node);
  });
  await rm(trash, { recursive: true, force: true });
}

function parentOf(nodes: PageNode[], siblings: PageNode[]): string | null {
  if (siblings === nodes) return null;
  return flatten(nodes).find((n) => n.children === siblings)?.id ?? null;
}
