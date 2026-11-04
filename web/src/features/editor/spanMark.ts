/**
 * Lê `<span data-<attr>="valor">…</span>` no começo de `src`, fechando no `</span>` certo mesmo com outro span
 * de dentro (cor dentro de fonte e o inverso). Devolve o texto todo, o valor e o miolo.
 */
export function matchSpan(src: string, attr: string): { raw: string; value: string; inner: string } | undefined {
  const open = new RegExp(`^<span data-${attr}="([a-z0-9-]+)">`).exec(src);
  if (!open) return undefined;
  let depth = 1;
  for (const tag of src.matchAll(/<span\b[^>]*>|<\/span>/g)) {
    if (tag.index < open[0].length) continue;
    depth += tag[0] === "</span>" ? -1 : 1;
    if (depth === 0) {
      const end = tag.index + tag[0].length;
      return { raw: src.slice(0, end), value: open[1] ?? "", inner: src.slice(open[0].length, tag.index) };
    }
  }
  return undefined;
}
