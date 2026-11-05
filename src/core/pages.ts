import { createHash, randomUUID } from "node:crypto";
import { rm, stat } from "node:fs/promises";
import path from "node:path";
import { isValidAudience, parseAudience, registerAudiences } from "./audience.js";
import { ExplicaiError } from "./errors.js";
import { joinFrontmatter, splitFrontmatter } from "./frontmatter.js";
import { atomicWrite, readText, relativePosix, resolveInside, uniquePath } from "./fs.js";
import { inQueue, PAGES_DIR, readManual, updateManual } from "./manuals.js";
import { isReviewedDate } from "./reviewed.js";
import { slugify } from "./text.js";
import { childrenOf, clampIndex, findIn, findNode, flatten } from "./tree.js";
import { PAGE_STATUSES, type Page, type PageNode, type PageStatus } from "./types.js";

/** Página pode ficar sem título enquanto é escrita: a árvore mostra "Sem título" e o arquivo vira sem-titulo.md. */
export async function addPage(
  dir: string,
  opts: { title: string; body?: string; parentId?: string | null; index?: number; audience?: string[] },
): Promise<Page> {
  const title = opts.title.trim();
  const page: Page = {
    id: randomUUID(),
    title,
    status: "rascunho",
    body: opts.body ?? "",
    file: await newPageFile(dir, title),
  };
  const audience = parseAudience(opts.audience);
  if (audience) page.audience = audience;

  // Arquivo primeiro: se gravar falhar, a árvore não aponta para o que não existe. Se a árvore falhar, desfaz o arquivo.
  await writePageFile(dir, page);
  page.version = await fileVersion(dir, page.file);
  page.rev = (await readPageFile(dir, page.file)).rev;
  try {
    await updateManual(dir, (meta) => {
      const siblings = childrenOf(meta.pages, opts.parentId);
      siblings.splice(clampIndex(opts.index, siblings.length), 0, { id: page.id, file: page.file, children: [] });
    });
  } catch (err) {
    await rm(resolveInside(dir, page.file), { force: true });
    throw err;
  }
  await registerAudiences(dir, page.audience);
  return page;
}

/** `allowNewer`: leitura de manual de formato mais novo (ver readManual). */
type ReadOpts = { allowNewer?: boolean };

export async function readPage(dir: string, id: string, opts?: ReadOpts): Promise<Page> {
  const { node } = findNode((await readManual(dir, opts)).pages, id);
  const { rev, ...rest } = await readPageFile(dir, node.file);
  return { id, ...rest, file: node.file, version: await fileVersion(dir, node.file), rev };
}

/** Versão do arquivo: mtime + tamanho. Basta para saber se alguém mexeu nele desde a última leitura. */
async function fileVersion(dir: string, file: string): Promise<string> {
  const s = await stat(resolveInside(dir, file));
  return `${s.mtimeMs}-${s.size}`;
}

/** Dentro da fila da pasta: recusa a gravação se o arquivo mudou no disco depois de `expected`. */
async function assertVersion(dir: string, file: string, expected: string): Promise<void> {
  if ((await fileVersion(dir, file)) === expected) return;
  throw new ExplicaiError(
    "disk-conflict",
    "Esta página foi alterada fora do Studio depois que você a abriu. Recarregue do disco ou mantenha a sua versão.",
  );
}

export interface PageTreeNode {
  id: string;
  title: string;
  status: PageStatus;
  file: string;
  /** Perfis que veem a página; sem o campo, todos. */
  audience?: string[];
  /** Dia da última conferência (`reviewed`, AAAA-MM-DD). */
  reviewed?: string;
  /** Preenchido quando o arquivo da página sumiu ou está com erro: a página aparece, com o aviso. */
  problem?: string;
  /** Versão escolhida para o manual final, quando há uma (ver versions.ts). */
  published?: string;
  children: PageTreeNode[];
}

/**
 * Árvore do manual com o título de cada página (que fica no frontmatter). Lê o manual.json uma vez.
 * Uma página com problema não derruba a árvore: ela vem com `problem` e o resto continua.
 */
export async function readPageTree(dir: string, opts?: ReadOpts): Promise<PageTreeNode[]> {
  const walk = (nodes: PageNode[]): Promise<PageTreeNode[]> =>
    Promise.all(
      nodes.map(async (n) => {
        const base = {
          id: n.id,
          file: n.file,
          ...(n.published ? { published: n.published } : {}),
          children: await walk(n.children),
        };
        try {
          const { title, status, audience, reviewed } = await readPageFile(dir, n.file);
          return { ...base, title, status, ...(audience ? { audience } : {}), ...(reviewed ? { reviewed } : {}) };
        } catch (err) {
          return { ...base, title: "", status: "rascunho" as const, problem: err instanceof Error ? err.message : String(err) };
        }
      }),
    );
  return walk((await readManual(dir, opts)).pages);
}

/** Lê título e corpo de um arquivo de página, com mensagem clara quando ele foi apagado ou estragado. */
async function readPageFile(
  dir: string,
  file: string,
): Promise<{
  title: string;
  status: PageStatus;
  body: string;
  rev: string;
  audience?: string[];
  reviewed?: string;
  extra?: Record<string, unknown>;
}> {
  let text: string;
  try {
    text = await readText(resolveInside(dir, file));
  } catch (err) {
    if ((err as { code?: string }).code === "ENOENT") {
      throw new Error(`O arquivo ${file} não foi encontrado. Ele foi apagado ou renomeado fora do Studio.`);
    }
    throw err;
  }
  try {
    const { data, body } = splitFrontmatter(text);
    const status = PAGE_STATUSES.includes(data.status as PageStatus) ? (data.status as PageStatus) : "rascunho";
    const rev = createHash("sha256").update(text).digest("hex").slice(0, 16);
    const { id: _id, title, status: _s, audience, ...extra } = data;
    // Data inválida vale como sem data, mas fica em `extra` e volta como veio.
    const reviewed = isReviewedDate(extra.reviewed) ? extra.reviewed : undefined;
    if (reviewed) delete extra.reviewed;
    if (!isValidAudience(audience)) throw new Error("audience deve ser um texto ou uma lista de textos, como [admin, operador].");
    const aud = parseAudience(audience);
    return {
      title: typeof title === "string" ? title : "",
      status,
      body,
      rev,
      ...(aud ? { audience: aud } : {}),
      ...(reviewed ? { reviewed } : {}),
      ...(Object.keys(extra).length ? { extra } : {}),
    };
  } catch (err) {
    const detail = err instanceof Error ? err.message.split("\n")[0] : String(err);
    throw new Error(`O cabeçalho (frontmatter) de ${file} tem um erro: ${detail}`);
  }
}

/**
 * Quando o título muda, o arquivo é renomeado para acompanhar, para a pasta continuar legível
 * para pessoas e IAs. O id no frontmatter não muda, e é ele que as áreas clicáveis usam.
 * `fileName`: "keep" grava o título no mesmo arquivo (digitação em andamento); "sync" renomeia
 * se o nome do arquivo não combina com o título (ao parar de digitar ou sair da página).
 */
export async function updatePage(
  dir: string,
  id: string,
  patch: { title?: string; body?: string; status?: PageStatus; audience?: string[] | null; reviewed?: string },
  opts: {
    fileName?: "keep" | "sync" | undefined;
    ifMatch?: string | undefined;
    ifRev?: string | undefined;
    /** Roda dentro da fila, depois de `ifRev`/`ifMatch` passarem e antes de gravar (ex.: guardar versão). */
    beforeWrite?: (() => Promise<void>) | undefined;
  } = {},
): Promise<Page> {
  const page = await readPage(dir, id);
  if (patch.status !== undefined && !PAGE_STATUSES.includes(patch.status)) {
    throw new Error(`Status inválido: ${patch.status}. Use ${PAGE_STATUSES.join(", ")}.`);
  }
  if (patch.reviewed !== undefined && !isReviewedDate(patch.reviewed)) {
    throw new Error(`Data inválida em reviewed: ${patch.reviewed}. Use AAAA-MM-DD.`);
  }
  const next: Page = {
    ...page,
    ...(patch.reviewed === undefined ? {} : { reviewed: patch.reviewed }),
    ...(patch.status === undefined ? {} : { status: patch.status }),
    ...(patch.title === undefined ? {} : { title: patch.title.trim() }),
    ...(patch.body === undefined ? {} : { body: patch.body }),
  };
  if (patch.audience !== undefined) {
    const audience = parseAudience(patch.audience);
    if (audience) next.audience = audience;
    else delete next.audience;
  }

  const sameName =
    opts.fileName === "keep" ||
    (opts.fileName === "sync" ? fileMatchesTitle(page.file, next.title) : slugify(next.title) === slugify(page.title));
  const { ifMatch, ifRev, beforeWrite } = opts;
  // Dentro da fila da pasta: rev e versão em disco são conferidos no mesmo passo da gravação.
  const check = async () => {
    if (ifRev !== undefined && ifRev !== (await readPage(dir, id)).rev) {
      throw new ExplicaiError(
        "rev-conflict",
        "A página mudou desde a última leitura. Leia a página de novo (read_page) e refaça a edição com o rev novo.",
      );
    }
    if (ifMatch !== undefined) await assertVersion(dir, page.file, ifMatch);
    await beforeWrite?.();
  };
  if (sameName) {
    if (ifMatch === undefined && ifRev === undefined && beforeWrite === undefined) await writePageFile(dir, next);
    else {
      await inQueue(dir, async () => {
        await check();
        await writePageFile(dir, next);
      });
    }
    await registerAudiences(dir, next.audience);
    return { ...next, version: await fileVersion(dir, next.file), rev: (await readPageFile(dir, next.file)).rev };
  }

  // shortcut: com renomeio, a checagem e a gravação não são atômicas (janela de milissegundos); upgrade se aparecer na prática.
  if (ifMatch !== undefined || ifRev !== undefined || beforeWrite !== undefined) await inQueue(dir, check);
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
  await registerAudiences(dir, next.audience);
  return { ...next, version: await fileVersion(dir, next.file), rev: (await readPageFile(dir, next.file)).rev };
}

/** O arquivo já tem o nome do título: `titulo.md` ou `titulo-2.md` (sufixo que `uniquePath` põe). */
function fileMatchesTitle(file: string, title: string): boolean {
  const base = path.posix.basename(file, ".md");
  const want = slugify(title);
  return base === want || (base.startsWith(`${want}-`) && /^\d+$/.test(base.slice(want.length + 1)));
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
    const text = await readText(abs);
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
  // Rascunho é o padrão e não vai para o arquivo: página escrita à mão continua igual.
  const status = page.status === "rascunho" ? {} : { status: page.status };
  const audience = page.audience?.length ? { audience: page.audience } : {};
  // Campos que o Studio não conhece voltam como vieram; os conhecidos vêm por último e vencem.
  const reviewed = page.reviewed ? { reviewed: page.reviewed } : {};
  const data = { ...page.extra, id: page.id, title: page.title, ...status, ...audience, ...reviewed };
  await atomicWrite(resolveInside(dir, page.file), joinFrontmatter(data, page.body));
}
