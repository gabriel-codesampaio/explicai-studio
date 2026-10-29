import { readManual } from "../manuals.js";
import { readPage } from "../pages.js";
import type { ManualMeta, PageNode } from "../types.js";
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

/**
 * As páginas na ordem da árvore, com o texto que vai para o manual final: a versão marcada
 * "No manual" quando existe, senão o texto atual. Página com problema fica de fora e vira aviso.
 */
export async function collectPages(dir: string): Promise<Collected> {
  const meta = await readManual(dir);
  const pages: ExportPage[] = [];
  const warnings: string[] = [];

  const walk = async (nodes: PageNode[], prefix: string, depth: number) => {
    for (const [i, node] of nodes.entries()) {
      const number = prefix ? `${prefix}.${i + 1}` : String(i + 1);
      try {
        const source = node.published ? await readVersion(dir, node.id, node.published) : await readPage(dir, node.id);
        pages.push({
          id: node.id,
          title: source.title || "Sem título",
          number,
          depth,
          fileName: node.file.split("/").pop() ?? node.file,
          body: source.body,
        });
      } catch (err) {
        warnings.push(`${node.file}: ${err instanceof Error ? err.message : String(err)}`);
      }
      await walk(node.children, number, depth + 1);
    }
  };
  await walk(meta.pages, "", 0);
  return { meta, pages, warnings };
}
