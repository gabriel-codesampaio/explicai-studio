import { randomUUID } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { joinFrontmatter, splitFrontmatter } from "./frontmatter.js";
import { atomicWrite, relativePosix, resolveInside, uniquePath } from "./fs.js";
import { PAGES_DIR, readManual, updateManual } from "./manuals.js";
import { slugify } from "./text.js";
import { childrenOf, clampIndex, findIn, findNode } from "./tree.js";
import type { Page } from "./types.js";

/** Página pode ficar sem título enquanto é escrita: a árvore mostra "Sem título" e o arquivo vira sem-titulo.md. */
export async function addPage(
  dir: string,
  opts: { title: string; body?: string; parentId?: string | null; index?: number },
): Promise<Page> {
  const title = opts.title.trim();
  const page: Page = { id: randomUUID(), title, body: opts.body ?? "", file: await newPageFile(dir, title) };

  await updateManual(dir, (meta) => {
    const siblings = childrenOf(meta.pages, opts.parentId);
    siblings.splice(clampIndex(opts.index, siblings.length), 0, { id: page.id, file: page.file, children: [] });
  });
  await writePageFile(dir, page);
  return page;
}

export async function readPage(dir: string, id: string): Promise<Page> {
  const { node } = findNode((await readManual(dir)).pages, id);
  const { data, body } = splitFrontmatter(await readFile(resolveInside(dir, node.file), "utf8"));
  return { id, title: typeof data.title === "string" ? data.title : "", body, file: node.file };
}

/**
 * Quando o título muda, o arquivo é renomeado para acompanhar, para a pasta continuar legível
 * para pessoas e IAs. O id no frontmatter não muda, e é ele que as áreas clicáveis usam.
 */
export async function updatePage(dir: string, id: string, patch: { title?: string; body?: string }): Promise<Page> {
  const page = await readPage(dir, id);
  const next: Page = {
    ...page,
    ...(patch.title === undefined ? {} : { title: patch.title.trim() }),
    ...(patch.body === undefined ? {} : { body: patch.body }),
  };

  if (slugify(next.title) === slugify(page.title)) {
    await writePageFile(dir, next);
    return next;
  }

  next.file = await newPageFile(dir, next.title);
  await writePageFile(dir, next);
  await updateManual(dir, (meta) => {
    findNode(meta.pages, id).node.file = next.file;
  });
  await rm(resolveInside(dir, page.file), { force: true });
  return next;
}

export async function movePage(dir: string, id: string, to: { parentId: string | null; index: number }): Promise<void> {
  await updateManual(dir, (meta) => {
    const { node, siblings } = findNode(meta.pages, id);
    if (to.parentId && (to.parentId === id || findIn(node.children, to.parentId))) {
      throw new Error("Não dá para mover uma página para dentro dela mesma.");
    }
    siblings.splice(siblings.indexOf(node), 1);
    const target = childrenOf(meta.pages, to.parentId);
    target.splice(clampIndex(to.index, target.length), 0, node);
  });
}

async function newPageFile(dir: string, title: string): Promise<string> {
  return relativePosix(dir, await uniquePath(path.join(dir, PAGES_DIR), slugify(title), ".md"));
}

async function writePageFile(dir: string, page: Page): Promise<void> {
  await atomicWrite(resolveInside(dir, page.file), joinFrontmatter({ id: page.id, title: page.title }, page.body));
}
