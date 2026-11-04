import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { ExplicaiError } from "./errors.js";
import { atomicWrite, exists, readText, uniquePath } from "./fs.js";
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

/** Muda só o título em manual.json: pasta, slug, ids e demais campos ficam como estão. */
export async function renameManual(dir: string, title: string): Promise<string> {
  const clean = required(title, "título do manual");
  return updateManual(dir, (meta) => {
    meta.title = clean;
    return clean;
  });
}

/**
 * Manuais são as subpastas diretas do workspace que têm manual.json.
 * Manual com manual.json ilegível fica de fora da lista, para um manual estragado não impedir
 * de abrir os outros. Abrir ele pelo endereço mostra o erro de readManual.
 */
export async function listManuals(workspace: string): Promise<Manual[]> {
  const entries = await readdir(workspace, { withFileTypes: true });
  const manuals: Manual[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const dir = path.join(workspace, e.name);
    if (!(await exists(path.join(dir, META_FILE)))) continue;
    try {
      manuals.push({ dir, meta: await readManual(dir, { allowNewer: true }) });
    } catch {
      // manual.json corrompido: os outros manuais continuam abrindo.
    }
  }
  return manuals.sort((a, b) => a.meta.title.localeCompare(b.meta.title));
}

/**
 * `allowNewer`: só para leitura (Studio mostra o manual sem editar). Sem ele, formato mais novo
 * dá erro, e é assim que toda gravação do núcleo (Studio, CLI, MCP) recusa regravar o manual.
 */
export async function readManual(dir: string, opts: { allowNewer?: boolean } = {}): Promise<ManualMeta> {
  let meta: Partial<ManualMeta> | null;
  try {
    meta = JSON.parse(await readText(path.join(dir, META_FILE))) as Partial<ManualMeta> | null;
  } catch (err) {
    if (err instanceof SyntaxError)
      throw new Error(`O ${META_FILE} do manual "${path.basename(dir)}" não é um JSON válido: ${err.message}`);
    throw err;
  }
  const version = meta?.version as unknown;
  if (typeof version === "number" && version > FORMAT_VERSION) {
    if (opts.allowNewer) return meta as ManualMeta;
    throw new ExplicaiError(
      "format-newer",
      `Este manual usa o formato ${version}, mais novo que o ${FORMAT_VERSION} deste Studio. Atualize o Studio (npx explicai@latest) para editar. Nada foi alterado.`,
      { version, supported: FORMAT_VERSION },
    );
  }
  if (meta?.version !== FORMAT_VERSION) {
    throw new Error(`${META_FILE}: versão de formato não suportada (${String(meta?.version)})`);
  }
  return meta as ManualMeta;
}

export async function writeManual(dir: string, meta: ManualMeta): Promise<void> {
  await atomicWrite(path.join(dir, META_FILE), `${JSON.stringify(meta, null, 2)}\n`);
}

// shortcut: fila só dentro do processo, Studio e MCP no mesmo manual podem se atropelar; upgrade = lock de arquivo
const queues = new Map<string, Promise<unknown>>();

/**
 * Lê o manual, aplica a mudança e grava de volta. Concentra o ciclo ler-alterar-gravar da árvore.
 * Chamadas da mesma pasta entram numa fila, senão duas leituras simultâneas se atropelam e a última
 * gravação apaga a mudança da outra. `change` não pode chamar updateManual da mesma pasta (travaria).
 */
export function updateManual<T>(dir: string, change: (meta: ManualMeta) => T): Promise<T> {
  return inQueue(dir, async () => {
    const meta = await readManual(dir);
    const result = change(meta);
    await writeManual(dir, meta);
    return result;
  });
}

/** Roda `task` na fila da pasta (a mesma do updateManual). `task` não pode entrar na fila da mesma pasta de novo. */
export function inQueue<T>(dir: string, task: () => Promise<T>): Promise<T> {
  const key = path.resolve(dir);
  const run = (queues.get(key) ?? Promise.resolve()).catch(() => {}).then(task);
  queues.set(key, run);
  // Fila vazia: tira a pasta do Map. Falha já chega a quem chamou por `run`.
  const clean = () => {
    if (queues.get(key) === run) queues.delete(key);
  };
  run.then(clean, clean);
  return run;
}
