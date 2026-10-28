import type { PageNode } from "./types.js";

export interface Located {
  node: PageNode;
  /** O array que contém o nó, para inserir ou remover sem buscar de novo. */
  siblings: PageNode[];
}

export function findNode(nodes: PageNode[], id: string): Located {
  const found = findIn(nodes, id);
  if (!found) throw new Error(`Página não encontrada: ${id}`);
  return found;
}

export function findIn(nodes: PageNode[], id: string): Located | undefined {
  for (const node of nodes) {
    if (node.id === id) return { node, siblings: nodes };
    const inner = findIn(node.children, id);
    if (inner) return inner;
  }
  return undefined;
}

/** Lista de filhos onde inserir: os da página `parentId`, ou a raiz quando é null. */
export function childrenOf(nodes: PageNode[], parentId: string | null | undefined): PageNode[] {
  return parentId ? findNode(nodes, parentId).node.children : nodes;
}

/** Percorre a árvore em ordem de leitura (pai antes dos filhos). */
export function flatten(nodes: PageNode[]): PageNode[] {
  return nodes.flatMap((n) => [n, ...flatten(n.children)]);
}

export function clampIndex(index: number | undefined, length: number): number {
  return index === undefined ? length : Math.max(0, Math.min(index, length));
}
