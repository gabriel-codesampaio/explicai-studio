import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { emptyAnnotations, parseAnnotations } from "./annotations.js";
import { joinFrontmatter, splitFrontmatter } from "./frontmatter.js";
import { FORMAT_VERSION, type Annotations, type Manual, type ManualMeta, type Page, type PageNode } from "./types.js";

const META_FILE = "manual.json";

export function slugify(title: string): string {
  const slug = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return slug || "sem-titulo";
}

export async function createManual(workspace: string, opts: { title: string; language: string }): Promise<Manual> {
  const title = required(opts.title, "título do manual");
  const dir = await uniquePath(workspace, slugify(title), "");
  const meta: ManualMeta = { version: FORMAT_VERSION, title, language: opts.language, pages: [] };
  await mkdir(path.join(dir, "pages"), { recursive: true });
  await mkdir(path.join(dir, "assets"), { recursive: true });
  await writeMeta(dir, meta);
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
  const raw: unknown = JSON.parse(await readFile(path.join(dir, META_FILE), "utf8"));
  const meta = raw as ManualMeta;
  if (meta?.version !== FORMAT_VERSION) {
    throw new Error(`${META_FILE}: versão de formato não suportada (${String(meta?.version)})`);
  }
  return meta;
}

export async function addPage(
  dir: string,
  opts: { title: string; body?: string; parentId?: string | null; index?: number },
): Promise<Page> {
  const meta = await readManual(dir);
  const title = required(opts.title, "título da página");
  const id = randomUUID();
  const abs = await uniquePath(path.join(dir, "pages"), slugify(title), ".md");
  const file = toPosix(path.relative(dir, abs));
  const body = opts.body ?? "";

  const siblings = opts.parentId ? findNode(meta.pages, opts.parentId).node.children : meta.pages;
  siblings.splice(clampIndex(opts.index, siblings.length), 0, { id, file, children: [] });

  await atomicWrite(abs, joinFrontmatter({ id, title }, body));
  await writeMeta(dir, meta);
  return { id, title, body, file };
}

export async function readPage(dir: string, id: string): Promise<Page> {
  const meta = await readManual(dir);
  const { node } = findNode(meta.pages, id);
  const { data, body } = splitFrontmatter(await readFile(resolveInside(dir, node.file), "utf8"));
  return { id, title: typeof data.title === "string" ? data.title : "", body, file: node.file };
}

/** O nome do arquivo não muda quando o título muda: links e histórico do git continuam válidos. */
export async function updatePage(dir: string, id: string, patch: { title?: string; body?: string }): Promise<Page> {
  const page = await readPage(dir, id);
  const next: Page = {
    ...page,
    ...(patch.title === undefined ? {} : { title: required(patch.title, "título da página") }),
    ...(patch.body === undefined ? {} : { body: patch.body }),
  };
  await atomicWrite(resolveInside(dir, page.file), joinFrontmatter({ id, title: next.title }, next.body));
  return next;
}

export async function movePage(dir: string, id: string, to: { parentId: string | null; index: number }): Promise<void> {
  const meta = await readManual(dir);
  const { node, siblings } = findNode(meta.pages, id);
  if (to.parentId && (to.parentId === id || findIn(node.children, to.parentId))) {
    throw new Error("Não dá para mover uma página para dentro dela mesma.");
  }
  siblings.splice(siblings.indexOf(node), 1);
  const target = to.parentId ? findNode(meta.pages, to.parentId).node.children : meta.pages;
  target.splice(clampIndex(to.index, target.length), 0, node);
  await writeMeta(dir, meta);
}

/** Remove a página e todas as subpáginas. Imagens ficam, porque outras páginas podem usar. */
export async function removePage(dir: string, id: string): Promise<void> {
  const meta = await readManual(dir);
  const { node, siblings } = findNode(meta.pages, id);
  siblings.splice(siblings.indexOf(node), 1);
  await writeMeta(dir, meta);
  for (const n of flatten([node])) await rm(resolveInside(dir, n.file), { force: true });
}

/** Grava a imagem em `assets/` com nome único e devolve o caminho relativo ao manual. */
export async function saveAsset(dir: string, fileName: string, data: Uint8Array): Promise<string> {
  const ext = path.extname(fileName).toLowerCase();
  if (!/^\.(png|jpe?g|gif|webp|svg)$/.test(ext)) throw new Error(`Formato de imagem não suportado: ${ext || "sem extensão"}`);
  const name = path.basename(fileName);
  const abs = await uniquePath(path.join(dir, "assets"), slugify(name.slice(0, name.length - ext.length)), ext);
  await writeFile(abs, data, { flag: "wx" });
  return toPosix(path.relative(dir, abs));
}

export async function readAnnotations(dir: string, assetPath: string): Promise<Annotations> {
  const abs = annotationsPath(dir, assetPath);
  if (!(await exists(abs))) return emptyAnnotations();
  return parseAnnotations(JSON.parse(await readFile(abs, "utf8")));
}

export async function writeAnnotations(dir: string, assetPath: string, input: unknown): Promise<Annotations> {
  const annotations = parseAnnotations(input);
  await atomicWrite(annotationsPath(dir, assetPath), `${JSON.stringify(annotations, null, 2)}\n`);
  return annotations;
}

/** Percorre a árvore em ordem de leitura (pai antes dos filhos). */
export function flatten(nodes: PageNode[]): PageNode[] {
  return nodes.flatMap((n) => [n, ...flatten(n.children)]);
}

function annotationsPath(dir: string, assetPath: string): string {
  const abs = resolveInside(dir, assetPath);
  if (path.dirname(abs) !== path.join(dir, "assets")) throw new Error("Anotações só existem para imagens em assets/.");
  return `${abs}.json`;
}

/** Barreira de confiança: caminhos vêm do Agent e do navegador, então nada pode sair da pasta do manual. */
export function resolveInside(dir: string, relative: string): string {
  const root = path.resolve(dir);
  const abs = path.resolve(root, relative);
  if (abs !== root && !abs.startsWith(root + path.sep)) throw new Error(`Caminho fora do manual: ${relative}`);
  return abs;
}

function findNode(nodes: PageNode[], id: string): { node: PageNode; siblings: PageNode[] } {
  const found = findIn(nodes, id);
  if (!found) throw new Error(`Página não encontrada: ${id}`);
  return found;
}

function findIn(nodes: PageNode[], id: string): { node: PageNode; siblings: PageNode[] } | undefined {
  for (const node of nodes) {
    if (node.id === id) return { node, siblings: nodes };
    const inner = findIn(node.children, id);
    if (inner) return inner;
  }
  return undefined;
}

async function writeMeta(dir: string, meta: ManualMeta): Promise<void> {
  await atomicWrite(path.join(dir, META_FILE), `${JSON.stringify(meta, null, 2)}\n`);
}

/** Grava num arquivo temporário e renomeia, para um travamento no meio não deixar o arquivo pela metade. */
async function atomicWrite(file: string, content: string): Promise<void> {
  const tmp = `${file}.${randomUUID()}.tmp`;
  await writeFile(tmp, content, "utf8");
  await rename(tmp, file);
}

async function uniquePath(parent: string, base: string, ext: string): Promise<string> {
  for (let i = 1; ; i++) {
    const candidate = path.join(parent, `${i === 1 ? base : `${base}-${i}`}${ext}`);
    if (!(await exists(candidate))) return candidate;
  }
}

async function exists(p: string): Promise<boolean> {
  return stat(p).then(
    () => true,
    () => false,
  );
}

function clampIndex(index: number | undefined, length: number): number {
  return index === undefined ? length : Math.max(0, Math.min(index, length));
}

function required(value: string, what: string): string {
  const v = value.trim();
  if (!v) throw new Error(`O ${what} não pode ficar vazio.`);
  return v;
}

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}
