import { readdir } from "node:fs/promises";
import path from "node:path";
import { ExplicaiError } from "./errors.js";
import { joinFrontmatter, splitFrontmatter } from "./frontmatter.js";
import { atomicWrite, readText, resolveInside } from "./fs.js";
import { inQueue, readManual, updateManual, writeManual } from "./manuals.js";
import { TRASH_DIR } from "./trash.js";
import { flatten } from "./tree.js";
import type { ManualMeta, PageNode } from "./types.js";

/** Lista de perfis limpa (sem vazios nem repetidos). Texto solto vira lista de um; vazio ou tipo errado: undefined. */
export function parseAudience(value: unknown): string[] | undefined {
  const list = typeof value === "string" ? [value] : Array.isArray(value) ? value : [];
  const clean = [
    ...new Set(
      list
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  ];
  return clean.length ? clean : undefined;
}

/** `audience` válido: texto ou lista de textos. Outro tipo é erro de quem escreveu o arquivo, não "todos". */
export function isValidAudience(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    typeof value === "string" ||
    (Array.isArray(value) && value.every((v) => typeof v === "string"))
  );
}

/** Põe os perfis da página na lista do manual (`audiences`), para o Studio e o MCP oferecerem os que já existem. */
export function registerAudiences(dir: string, audience: string[] | undefined): Promise<void> {
  if (!audience?.length) return Promise.resolve();
  return updateManual(dir, (meta) => {
    const all = [...new Set([...(meta.audiences ?? []), ...audience])];
    if (all.length !== meta.audiences?.length) meta.audiences = all;
  });
}

/** O perfil vê a página? Sem restrição própria, vale a do pai (`parentOk`); com ela, vale o cruzamento das duas. */
export function seesPage(audience: string[] | undefined, profile: string | undefined, parentOk = true): boolean {
  return parentOk && (profile === undefined || !audience || audience.includes(profile));
}

const MAX_NAME = 40;

/** Nome limpo, ou erro tipado com o motivo (a interface traduz pelo `code`). */
function cleanName(raw: string): string {
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) throw new ExplicaiError("audience-empty", "O nome do público não pode ficar vazio.");
  if (name.length > MAX_NAME) {
    throw new ExplicaiError("audience-too-long", `O nome do público tem no máximo ${MAX_NAME} caracteres.`, { max: MAX_NAME });
  }
  return name;
}

const same = (a: string, b: string) => a.toLocaleLowerCase() === b.toLocaleLowerCase();

function assertFree(meta: ManualMeta, name: string, except?: string): void {
  if ((meta.audiences ?? []).some((a) => a !== except && same(a, name))) {
    throw new ExplicaiError("audience-duplicate", `Já existe um público chamado "${name}".`, { name });
  }
}

interface PageFile {
  abs: string;
  /** Página fora da lixeira: tem id no manual.json. */
  id?: string;
}

/** Arquivos de página do manual e da lixeira (só leitura da lixeira: entry.json diz quais são). */
async function pageFiles(dir: string, meta: ManualMeta): Promise<PageFile[]> {
  const files: PageFile[] = flatten(meta.pages).map((n) => ({ abs: resolveInside(dir, n.file), id: n.id }));
  const trash = path.join(dir, TRASH_DIR);
  const ids = await readdir(trash).catch(() => [] as string[]);
  for (const trashId of ids) {
    try {
      const entry = JSON.parse(await readText(path.join(trash, trashId, "entry.json"))) as { node: PageNode };
      const root = path.join(trash, trashId);
      files.push(...flatten([entry.node]).map((n) => ({ abs: resolveInside(root, n.file) })));
    } catch {
      // entrada da lixeira ilegível: fica como está
    }
  }
  return files;
}

/**
 * Troca a lista `audience` de cada página que muda com `edit` (lista vazia remove o campo).
 * Idempotente: página já no estado novo não é regravada, então repetir após falha termina o serviço.
 */
async function editPages(files: PageFile[], edit: (list: string[]) => string[]) {
  const changed: { id?: string; title: string; freed: boolean }[] = [];
  for (const f of files) {
    let parsed: ReturnType<typeof splitFrontmatter>;
    try {
      parsed = splitFrontmatter(await readText(f.abs));
    } catch {
      continue; // arquivo sumido ou com frontmatter quebrado: o Studio já avisa na árvore
    }
    const { data, body } = parsed;
    const cur = parseAudience(data.audience) ?? [];
    const next = [...new Set(edit(cur))];
    if (next.length === cur.length && next.every((n, i) => n === cur[i])) continue;
    if (next.length) data.audience = next;
    else delete data.audience;
    await atomicWrite(f.abs, joinFrontmatter(data, body));
    changed.push({ ...(f.id ? { id: f.id } : {}), title: typeof data.title === "string" ? data.title : "", freed: !next.length });
  }
  return changed;
}

export async function addAudience(dir: string, raw: string): Promise<string> {
  const name = cleanName(raw);
  await updateManual(dir, (meta) => {
    assertFree(meta, name);
    meta.audiences = [...(meta.audiences ?? []), name];
  });
  return name;
}

/**
 * Renomeia o público na lista e em todas as páginas que o citam (lixeira incluída).
 * Páginas primeiro, manual.json por último: falhou no meio, repetir termina.
 */
export function renameAudience(dir: string, from: string, raw: string): Promise<{ name: string; pages: number }> {
  return inQueue(dir, async () => {
    const name = cleanName(raw);
    const meta = await readManual(dir);
    assertFree(meta, name, from);
    const changed = await editPages(await pageFiles(dir, meta), (l) => l.map((a) => (a === from ? name : a)));
    if (!changed.length && !meta.audiences?.includes(from)) notFound(from);
    meta.audiences = [...new Set((meta.audiences ?? []).map((a) => (a === from ? name : a)))];
    await writeManual(dir, meta);
    return { name, pages: changed.length };
  });
}

/**
 * Remove o público da lista e das páginas. Página que só tinha ele volta a "todos" e vem em `freed`
 * (só as do manual, não as da lixeira). Mesma ordem do renameAudience; após falha no meio, `freed`
 * da repetição só traz as páginas que ainda faltavam.
 */
export function removeAudience(dir: string, name: string): Promise<{ freed: { id: string; title: string }[] }> {
  return inQueue(dir, async () => {
    const meta = await readManual(dir);
    const changed = await editPages(await pageFiles(dir, meta), (l) => l.filter((a) => a !== name));
    if (!changed.length && !meta.audiences?.includes(name)) notFound(name);
    meta.audiences = (meta.audiences ?? []).filter((a) => a !== name);
    await writeManual(dir, meta);
    const freed = changed.flatMap((c) => (c.freed && c.id ? [{ id: c.id, title: c.title }] : []));
    return { freed };
  });
}

function notFound(name: string): never {
  throw new ExplicaiError("audience-not-found", `Público "${name}" não encontrado.`, { name });
}
