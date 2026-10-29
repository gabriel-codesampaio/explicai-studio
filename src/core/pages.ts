import { randomUUID } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { joinFrontmatter, splitFrontmatter } from "./frontmatter.js";
import { atomicWrite, relativePosix, resolveInside, uniquePath } from "./fs.js";
import { PAGES_DIR, readManual, updateManual } from "./manuals.js";
import { slugify } from "./text.js";
import { childrenOf, clampIndex, findIn, findNode, flatten } from "./tree.js";
import type { Page, PageNode } from "./types.js";

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
  return { id, ...(await readPageFile(dir, node.file)), file: node.file };
}

export interface PageTreeNode {
  id: string;
  title: string;
  file: string;
  /** Preenchido quando o arquivo da página sumiu ou está com erro: a página aparece, com o aviso. */
  problem?: string;
  children: PageTreeNode[];
}

/**
 * Árvore do manual com o título de cada página (que fica no frontmatter). Lê o manual.json uma vez.
 * Uma página com problema não derruba a árvore: ela vem com `problem` e o resto continua.
 */
export async function readPageTree(dir: string): Promise<PageTreeNode[]> {
  const walk = (nodes: PageNode[]): Promise<PageTreeNode[]> =>
    Promise.all(
      nodes.map(async (n) => {
        const base = { id: n.id, file: n.file, children: await walk(n.children) };
        try {
          return { ...base, title: (await readPageFile(dir, n.file)).title };
        } catch (err) {
          return { ...base, title: "", problem: err instanceof Error ? err.message : String(err) };
        }
      }),
    );
  return walk((await readManual(dir)).pages);
}

/** Lê título e corpo de um arquivo de página, com mensagem clara quando ele foi apagado ou estragado. */
async function readPageFile(dir: string, file: string): Promise<{ title: string; body: string }> {
  let text: string;
  try {
    text = await readFile(resolveInside(dir, file), "utf8");
  } catch (err) {
    if ((err as { code?: string }).code === "ENOENT") {
      throw new Error(`O arquivo ${file} não foi encontrado. Ele foi apagado ou renomeado fora do Studio.`);
    }
    throw err;
  }
  try {
    const { data, body } = splitFrontmatter(text);
    return { title: typeof data.title === "string" ? data.title : "", body };
  } catch (err) {
    const detail = err instanceof Error ? err.message.split("\n")[0] : String(err);
    throw new Error(`O cabeçalho (frontmatter) de ${file} tem um erro: ${detail}`);
  }
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
  const others = await updateManual(dir, (meta) => {
    findNode(meta.pages, id).node.file = next.file;
    return flatten(meta.pages).filter((n) => n.id !== id);
  });
  await rm(resolveInside(dir, page.file), { force: true });
  await relink(
    dir,
    others.map((n) => n.file),
    page.file,
    next.file,
  );
  return next;
}

/** Links entre páginas são `./arquivo.md`. Quando um arquivo muda de nome, as outras páginas acompanham. */
async function relink(dir: string, files: string[], from: string, to: string): Promise<void> {
  const name = (f: string) => path.posix.basename(f);
  const escaped = name(from).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // ](arquivo.md  ou  ](./arquivo.md  seguido de ) ou de #âncora
  // Precisa ser new RegExp: o nome do arquivo entra no padrão (teste: "atualiza os links das outras páginas")
  const pattern = new RegExp(`(\\]\\()(?:\\./)?${escaped}(?=[)#])`, "g");
  for (const file of files) {
    const abs = resolveInside(dir, file);
    const text = await readFile(abs, "utf8");
    const updated = text.replace(pattern, `$1./${name(to)}`);
    if (updated !== text) await atomicWrite(abs, updated);
  }
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
