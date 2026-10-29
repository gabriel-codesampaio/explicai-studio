/**
 * Marcações de imagem do lado do editor. Os tipos espelham src/core/types.ts (formato em disco,
 * ver docs/manual-format.md); o servidor valida tudo de novo ao gravar.
 * Coordenadas vão de 0 a 1, relativas à largura e à altura da imagem.
 */

export interface Point {
  x: number;
  y: number;
}
export interface Rect extends Point {
  w: number;
  h: number;
}
export interface Marker extends Point {
  id: string;
  n: number;
  label?: string;
}
export interface Highlight extends Rect {
  id: string;
}
export interface Arrow {
  id: string;
  from: Point;
  to: Point;
}
export type HotspotTarget = { type: "page"; pageId: string } | { type: "url"; href: string };
export interface Hotspot extends Rect {
  id: string;
  target: HotspotTarget;
}
export interface Annotations {
  version: 1;
  markers: Marker[];
  highlights: Highlight[];
  arrows: Arrow[];
  hotspots: Hotspot[];
}

export type AnnotationKind = "marker" | "highlight" | "arrow" | "hotspot";

export const emptyAnnotations = (): Annotations => ({ version: 1, markers: [], highlights: [], arrows: [], hotspots: [] });

/** `/files/<manual>/assets/tela.png` → `assets/tela.png`. Imagem de fora do manual não tem marcações. */
export function assetPathFromSrc(src: string): string | null {
  const match = /^\/files\/[^/]+\/(assets\/[^?#]+)$/.exec(src);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function clampPoint(p: Point): Point {
  return { x: clamp(p.x), y: clamp(p.y) };
}

/** Retângulo entre dois cantos, em qualquer direção de arraste, dentro da imagem. */
export function rectFrom(a: Point, b: Point): Rect {
  const p = clampPoint(a);
  const q = clampPoint(b);
  return { x: Math.min(p.x, q.x), y: Math.min(p.y, q.y), w: Math.abs(p.x - q.x), h: Math.abs(p.y - q.y) };
}

/** Arraste curto demais vira clique, não desenho (1% da imagem). */
export function isTooSmall(a: Point, b: Point): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) < 0.01;
}

export function newId(kind: AnnotationKind): string {
  return `${kind[0]}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Marcadores sempre numerados 1, 2, 3… na ordem atual: excluir o 2 faz o 3 virar 2. */
export function renumber(markers: Marker[]): Marker[] {
  return [...markers].sort((a, b) => a.n - b.n).map((m, i) => ({ ...m, n: i + 1 }));
}

export function addMarker(ann: Annotations, at: Point): Annotations {
  const marker: Marker = { id: newId("marker"), n: ann.markers.length + 1, ...clampPoint(at) };
  return { ...ann, markers: [...ann.markers, marker] };
}

export function removeAnnotation(ann: Annotations, id: string): Annotations {
  return {
    ...ann,
    markers: renumber(ann.markers.filter((m) => m.id !== id)),
    highlights: ann.highlights.filter((h) => h.id !== id),
    arrows: ann.arrows.filter((a) => a.id !== id),
    hotspots: ann.hotspots.filter((h) => h.id !== id),
  };
}

export function countAnnotations(ann: Annotations): number {
  return ann.markers.length + ann.highlights.length + ann.arrows.length + ann.hotspots.length;
}

export type Tool = "select" | AnnotationKind;

/**
 * Cria a forma desenhada entre `a` (onde o arraste começou) e `b` (onde terminou).
 * Marcador é um clique; destaque, seta e área clicável precisam de arraste.
 * Devolve null quando o arraste foi curto demais para virar forma.
 */
export function addShape(ann: Annotations, tool: AnnotationKind, a: Point, b: Point, target: HotspotTarget): Annotations | null {
  if (tool === "marker") return addMarker(ann, a);
  if (isTooSmall(a, b)) return null;
  const id = newId(tool);
  if (tool === "arrow") return { ...ann, arrows: [...ann.arrows, { id, from: clampPoint(a), to: clampPoint(b) }] };
  const rect = rectFrom(a, b);
  if (tool === "highlight") return { ...ann, highlights: [...ann.highlights, { id, ...rect }] };
  return { ...ann, hotspots: [...ann.hotspots, { id, ...rect, target }] };
}

/** Atualiza um marcador ou área clicável pelo id (nome do marcador, destino da área). */
export function updateMarker(ann: Annotations, id: string, label: string): Annotations {
  return { ...ann, markers: ann.markers.map((m) => (m.id === id ? { ...m, label } : m)) };
}

export function updateHotspot(ann: Annotations, id: string, target: HotspotTarget): Annotations {
  return { ...ann, hotspots: ann.hotspots.map((h) => (h.id === id ? { ...h, target } : h)) };
}
