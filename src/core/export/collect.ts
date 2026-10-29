import { readManual } from "../manuals.js";
import { readPage } from "../pages.js";
import type { ManualMeta, PageNode, PageStatus } from "../types.js";
import { readVersion } from "../versions.js";

export interface ExportPage {
  id: string;
  title: string;
  /** Posição na árvore, como no sumário: "2", "2.1". */
  number: string;
  depth: number;
  /** Nome do arquivo (`cadastrar-cliente.md`), para achar a página pelos links `./arquivo.md`. */
  fileName: string;
  body: string;
}

export interface Collected {
  meta: ManualMeta;
  pages: ExportPage[];
  /** Páginas que ficaram de fora, com o motivo (arquivo apagado, versão sumida). */
  warnings: string[];
}

export interface CollectOptions {
  /** Só páginas aprovadas ou publicadas. Subpágina aprovada entra mesmo com a mãe em rascunho. */
  onlyApproved?: boolean;
}

const APPROVED: PageStatus[] = ["aprovado", "publicado"];

/**
 * As páginas na ordem da árvore, com o texto que vai para o manual final: a versão marcada
 * "No manual" quando existe, senão o texto atual. Página com problema fica de fora e vira aviso.
 * A numeração conta só as páginas que entram, então o sumário não fica com buracos.
 */
export async function collectPages(dir: string, opts: CollectOptions = {}): Promise<Collected> {
  const meta = await readManual(dir);
  const pages: ExportPage[] = [];
  const warnings: string[] = [];

  // `count` é compartilhado com os filhos de uma página que ficou de fora: eles sobem para o lugar dela.
  const walk = async (nodes: PageNode[], prefix: string, depth: number, count: { n: number }) => {
    for (const node of nodes) {
      let included = false;
      let number = prefix;
      try {
        const current = await readPage(dir, node.id);
        if (!opts.onlyApproved || APPROVED.includes(current.status)) {
          const source = node.published ? await readVersion(dir, node.id, node.published) : current;
          count.n += 1;
          number = prefix ? `${prefix}.${count.n}` : String(count.n);
          pages.push({
            id: node.id,
            title: source.title || "Sem título",
            number,
            depth,
            fileName: node.file.split("/").pop() ?? node.file,
            body: source.body,
          });
          included = true;
        }
      } catch (err) {
        warnings.push(`${node.file}: ${err instanceof Error ? err.message : String(err)}`);
      }
      if (included) await walk(node.children, number, depth + 1, { n: 0 });
      else await walk(node.children, prefix, depth, count);
    }
  };
  await walk(meta.pages, "", 0, { n: 0 });
  return { meta, pages, warnings };
}
