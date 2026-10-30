/**
 * Desenho das marcações, em funções puras. O editor tem uma cópia em web/src/lib/annotationShapes.ts
 * (o web não importa de src/); test/annotation-shapes.test.ts garante que as duas dão o mesmo resultado.
 */
interface Pt {
  x: number;
  y: number;
}

export interface ArrowShape {
  /** Haste: do começo até dentro da ponta, para não sobrar fresta. */
  shaft: { x1: number; y1: number; x2: number; y2: number };
  /** Vértices do triângulo da ponta: a ponta em `to`, a base perpendicular à haste. */
  head: [Pt, Pt, Pt];
}

/**
 * Seta com ponta fechada. O tamanho da ponta é proporcional à espessura e encolhe em setas curtas
 * (no máximo 70% do comprimento), sem perder a forma. `thickness` na mesma unidade de `from` e `to`.
 */
export function arrowShape(from: Pt, to: Pt, thickness: number): ArrowShape {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  const ux = len === 0 ? 1 : dx / len;
  const uy = len === 0 ? 0 : dy / len;
  const headLen = Math.min(thickness * 4.5, len * 0.7);
  const half = headLen * 0.45;
  const bx = to.x - ux * headLen;
  const by = to.y - uy * headLen;
  const inside = headLen * 0.2;
  return {
    shaft: { x1: from.x, y1: from.y, x2: bx + ux * inside, y2: by + uy * inside },
    head: [to, { x: bx - uy * half, y: by + ux * half }, { x: bx + uy * half, y: by - ux * half }],
  };
}

export interface LegendRow {
  numbers: number[];
  /** Vazio quando o marcador não tem descrição. */
  label: string;
}

/** Linhas da legenda por número; marcadores sem descrição em sequência dividem uma linha só. */
export function legendRows(markers: { n: number; label?: string }[]): LegendRow[] {
  const rows: LegendRow[] = [];
  for (const m of [...markers].sort((a, b) => a.n - b.n)) {
    const label = (m.label ?? "").trim();
    const last = rows.at(-1);
    if (!label && last && !last.label) last.numbers.push(m.n);
    else rows.push({ numbers: [m.n], label });
  }
  return rows;
}
