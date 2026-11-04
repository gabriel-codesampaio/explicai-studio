/**
 * Marcações de imagem do lado do editor. Os tipos espelham src/core/types.ts (formato em disco,
 * ver docs/manual-format.md); o servidor valida tudo de novo ao gravar.
 * Coordenadas vão de 0 a 1, relativas à largura e à altura da imagem.
 */

import { ARROW_MIN_DRAG } from "./annotationShapes";
import type { AnnotationStyle } from "./annotationStyle";
import { decodeComponent } from "./text";

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
export type ImageDisplay = "s" | "m" | "full";
export interface Annotations {
  version: 1;
  display?: ImageDisplay;
  style?: AnnotationStyle;
  markers: Marker[];
  highlights: Highlight[];
  arrows: Arrow[];
  hotspots: Hotspot[];
}

/** Largura máxima de cada tamanho, em % da coluna. Igual ao HTML exportado (`annotationCss.ts`). */
export const DISPLAY_WIDTH: Record<ImageDisplay, string> = { s: "40%", m: "70%", full: "100%" };

/** Marcadores de 24 px se sobrepõem numa imagem pequena: a partir de 4, o editor avisa. */
export const SMALL_MARKER_WARNING = 4;
export const warnsSmall = (ann: Annotations): boolean => ann.display === "s" && ann.markers.length >= SMALL_MARKER_WARNING;

export type AnnotationKind = "marker" | "highlight" | "arrow" | "hotspot";

export const emptyAnnotations = (): Annotations => ({ version: 1, markers: [], highlights: [], arrows: [], hotspots: [] });

/** `/files/<manual>/assets/tela.png` → `assets/tela.png`. Imagem de fora do manual não tem marcações. */
export function assetPathFromSrc(src: string): string | null {
  const match = /^\/files\/[^/]+\/(assets\/[^?#]+)$/.exec(src);
  return match?.[1] ? decodeComponent(match[1]) : null;
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

/** O rascunho difere do gravado? Áreas a ocultar ou recortar ainda não aplicadas contam como mudança. */
export function draftChanged(
  draft: { ann: Annotations; redact: unknown[]; crop: unknown[] },
  saved: Annotations | null,
): boolean {
  if (draft.redact.length > 0 || draft.crop.length > 0) return true;
  return JSON.stringify(draft.ann) !== JSON.stringify(saved ?? emptyAnnotations());
}

export function countAnnotations(ann: Annotations): number {
  return ann.markers.length + ann.highlights.length + ann.arrows.length + ann.hotspots.length;
}

/** "redact" não é marcação: os retângulos ficam num rascunho à parte e viram pixels ao aplicar. */
export type Tool = "select" | AnnotationKind | "redact" | "crop";

/**
 * Cria a forma desenhada entre `a` (onde o arraste começou) e `b` (onde terminou).
 * Marcador é um clique; destaque, seta e área clicável precisam de arraste.
 * Devolve null quando o arraste foi curto demais para virar forma.
 */
export function addShape(ann: Annotations, tool: AnnotationKind, a: Point, b: Point, target: HotspotTarget): Annotations | null {
  if (tool === "marker") return addMarker(ann, a);
  if (isTooSmall(a, b)) return null;
  if (tool === "arrow" && Math.hypot(a.x - b.x, a.y - b.y) < ARROW_MIN_DRAG) return null;
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

const KEY_STEP: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

/** Seta `id` deslocada pela tecla de seta: 1% da imagem, 5% com Shift. Null se a tecla ou a marcação não servem. */
export function nudge(ann: Annotations, id: string, key: string, big: boolean): Annotations | null {
  const dir = KEY_STEP[key];
  if (!dir || !ann.arrows.some((a) => a.id === id)) return null;
  const step = big ? 0.05 : 0.01;
  return moveAnnotation(ann, id, "move", dir[0] * step, dir[1] * step);
}

/** Parte da marcação que está sendo arrastada: ela inteira, um canto do retângulo ou uma ponta da seta. */
export type Handle = "move" | "nw" | "ne" | "sw" | "se" | "from" | "to";

const shift = (p: Point, dx: number, dy: number): Point => clampPoint({ x: p.x + dx, y: p.y + dy });

/** Retângulo deslocado sem sair da imagem (encosta na borda em vez de encolher). */
function moveRect<T extends Rect>(r: T, dx: number, dy: number): T {
  return { ...r, x: Math.min(1 - r.w, Math.max(0, r.x + dx)), y: Math.min(1 - r.h, Math.max(0, r.y + dy)) };
}

/** Canto arrastado de um retângulo; o canto oposto fica parado. */
function resizeRect<T extends Rect>(r: T, handle: Handle, dx: number, dy: number): T {
  const left = handle === "nw" || handle === "sw";
  const top = handle === "nw" || handle === "ne";
  const moving = { x: (left ? r.x : r.x + r.w) + dx, y: (top ? r.y : r.y + r.h) + dy };
  const fixed = { x: left ? r.x + r.w : r.x, y: top ? r.y + r.h : r.y };
  return { ...r, ...rectFrom(moving, fixed) };
}

/**
 * Marcação `id` arrastada por (dx, dy), em frações da imagem. "move" desloca tudo; os cantos
 * redimensionam destaques e áreas clicáveis; "from" e "to" movem uma ponta da seta.
 */
export function moveAnnotation(ann: Annotations, id: string, handle: Handle, dx: number, dy: number): Annotations {
  const rect = <T extends Rect>(r: T) => (handle === "move" ? moveRect(r, dx, dy) : resizeRect(r, handle, dx, dy));
  return {
    ...ann,
    markers: ann.markers.map((m) => (m.id === id ? { ...m, ...shift(m, dx, dy) } : m)),
    highlights: ann.highlights.map((h) => (h.id === id ? rect(h) : h)),
    hotspots: ann.hotspots.map((h) => (h.id === id ? rect(h) : h)),
    arrows: ann.arrows.map((a) =>
      a.id !== id
        ? a
        : {
            ...a,
            from: handle === "to" ? a.from : shift(a.from, dx, dy),
            to: handle === "from" ? a.to : shift(a.to, dx, dy),
          },
    ),
  };
}
