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
  n: number;
  label: string;
}

/** Linhas da legenda por número. Marcador sem descrição não tem linha: o número no print basta. */
export function legendRows(markers: { n: number; label?: string }[]): LegendRow[] {
  return [...markers]
    .sort((a, b) => a.n - b.n)
    .map((m) => ({ n: m.n, label: (m.label ?? "").trim() }))
    .filter((r) => r.label);
}

/** Diâmetro do disco do marcador, em px. */
export const MARKER_DISC = 24;

export interface MarkerShape {
  /** Centro do disco, relativo ao alvo (a posição gravada). */
  disc: Pt;
  /** Triângulo da cauda, relativo ao alvo: a ponta em (0, 0), a base na borda do disco. Null se o alvo cai dentro do disco. */
  tail: [Pt, Pt, Pt] | null;
}

const REACH = 1.15; // centro do disco a REACH x diâmetro do alvo: sobra uma cauda de ~0,65 diâmetro
const GAP = 2;

/**
 * Onde cada marcador desenha o disco. O alvo é a posição gravada; o disco sobe e vai para o lado com mais
 * espaço, ligado ao alvo por uma cauda. Tenta outros ângulos quando o disco sairia da imagem ou cobriria
 * outro disco ou outro alvo. `w` e `h` na mesma unidade dos alvos (px); a ordem da lista decide quem escolhe primeiro.
 */
export function placeMarkers(targets: Pt[], w: number, h: number, size = MARKER_DISC): MarkerShape[] {
  const r = size / 2;
  const reach = size * REACH;
  const placed: Pt[] = [];
  const fits = (c: Pt, self: number) =>
    c.x >= r &&
    c.x <= w - r &&
    c.y >= r &&
    c.y <= h - r &&
    placed.every((o) => Math.hypot(c.x - o.x, c.y - o.y) >= size + GAP) &&
    targets.every((t, j) => j === self || Math.hypot(c.x - t.x, c.y - t.y) >= r + GAP);
  return targets.map((t, i) => {
    const side = t.x < w / 2 ? 1 : -1;
    const around = [45, -45, 0, 90, -90, 135, -135, 180].map((deg) => (deg * side * Math.PI) / 180);
    const at = (a: number): Pt => ({ x: t.x + Math.sin(a) * reach, y: t.y - Math.cos(a) * reach });
    const found = around.map(at).find((c) => fits(c, i)) ?? at(around[0] as number);
    const c = { x: Math.min(Math.max(found.x, r), w - r), y: Math.min(Math.max(found.y, r), h - r) };
    placed.push(c);
    const len = Math.hypot(t.x - c.x, t.y - c.y);
    if (len <= r) return { disc: { x: c.x - t.x, y: c.y - t.y }, tail: null };
    const [ux, uy] = [(t.x - c.x) / len, (t.y - c.y) / len];
    const [along, half] = [r * Math.cos(0.6), r * Math.sin(0.6)]; // base a ~34 graus de cada lado
    const base = (k: number): Pt => ({
      x: c.x - t.x + ux * along - uy * half * k,
      y: c.y - t.y + uy * along + ux * half * k,
    });
    return { disc: { x: c.x - t.x, y: c.y - t.y }, tail: [{ x: 0, y: 0 }, base(1), base(-1)] };
  });
}
