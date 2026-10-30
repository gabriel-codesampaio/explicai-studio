/**
 * Níveis dos títulos do corpo de uma página no manual exportado, sem pular nível.
 * O título mais alto da página vira o nível logo abaixo do título da página (`titleLevel + 1`),
 * os outros mantêm a diferença entre si, e nenhum desce mais de um nível por vez.
 * `depths` são os níveis do Markdown (1 a 6), na ordem em que aparecem.
 */
export function exportLevels(depths: number[], titleLevel: number): number[] {
  if (!depths.length) return [];
  const top = Math.min(...depths);
  let prev = titleLevel;
  return depths.map((d) => {
    prev = Math.min(titleLevel + 1 + d - top, prev + 1, 6);
    return prev;
  });
}
