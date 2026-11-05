import { splitFrontmatter } from "./frontmatter.js";
import { readText, resolveInside } from "./fs.js";
import { readManual } from "./manuals.js";
import { flatten } from "./tree.js";

const MARKS = /[̀-ͯ]/g;
const SNIPPET_SIDE = 60;

/** Texto sem acento e em minúscula, para comparar buscas. */
export function foldText(text: string): string {
  return text.normalize("NFD").replace(MARKS, "").toLowerCase();
}

export interface BodyHit {
  id: string;
  title: string;
  /** Trecho em três partes (o termo no meio, como está no texto), para a interface destacar sem montar HTML. */
  before: string;
  match: string;
  after: string;
}

/** Tira a sintaxe Markdown do trecho (`**`, `|`, links, imagens) para ele ler como texto; um link cortado ao meio também sai. */
function plain(text: string): string {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*(\)|$)/g, "$1")
    .replace(/^\]\([^)]*(\)|$)/, "")
    .replace(/-{3,}|\|+/g, " ")
    .replace(/[*`#>~=[\]]+/g, "")
    .replace(/\s+/g, " ");
}

/** Se o trecho começou no meio do texto, tira a palavra cortada do início. */
function cutWord(text: string, cut: boolean): string {
  return cut ? text.replace(/^\S*\s/, "") : text;
}

/** Texto sem acento e, para cada letra dele, onde ela começa no original (o trecho sai do original). */
function foldWithMap(text: string): { folded: string; start: number[] } {
  let folded = "";
  const start: number[] = [];
  let i = 0;
  for (const ch of text) {
    const f = foldText(ch);
    for (let k = 0; k < f.length; k++) start.push(i);
    folded += f;
    i += ch.length;
  }
  start.push(text.length);
  return { folded, start };
}

/**
 * Busca `query` (sem acento nem caixa) no corpo das páginas do manual, na ordem da árvore.
 * Lê os arquivos na hora, sem índice: a lixeira não está na árvore, então fica de fora.
 * Página ilegível é pulada. Só a primeira ocorrência de cada página vira trecho.
 */
export async function searchBodies(
  dir: string,
  query: string,
  opts: { limit?: number; allowNewer?: boolean } = {},
): Promise<BodyHit[]> {
  const q = foldText(query.trim());
  if (!q) return [];
  const limit = opts.limit ?? 30;
  // Todos os arquivos lidos de uma vez (a ordem da árvore é mantida); o mapa de posições só sai para quem tem o termo.
  const found = await Promise.all(
    flatten((await readManual(dir, opts)).pages).map(async (node): Promise<BodyHit | null> => {
      try {
        const { data, body } = splitFrontmatter(await readText(resolveInside(dir, node.file)));
        if (!foldText(body).includes(q)) return null;
        const { folded, start } = foldWithMap(body);
        const at = folded.indexOf(q);
        if (at < 0) return null;
        const from = start[at] as number;
        const to = start[at + q.length] as number;
        return {
          id: node.id,
          title: typeof data.title === "string" ? data.title : "",
          before: cutWord(plain(body.slice(Math.max(0, from - SNIPPET_SIDE), from)), from > SNIPPET_SIDE),
          match: body.slice(from, to),
          after: plain(body.slice(to, to + SNIPPET_SIDE)),
        };
      } catch {
        return null; // arquivo sumido ou com frontmatter quebrado: a árvore já mostra o problema
      }
    }),
  );
  const hits = found.filter((h): h is BodyHit => h !== null).slice(0, limit);
  return hits;
}
