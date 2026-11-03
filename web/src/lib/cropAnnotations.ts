import type { Annotations, Point, Rect } from "./annotations";

export interface CropResult {
  annotations: Annotations;
  /** O que ficou fora da área de recorte e sumiu. */
  removed: { markers: number; highlights: number; arrows: number; hotspots: number };
}

const inside = (p: Point, c: Rect) => p.x >= c.x && p.x <= c.x + c.w && p.y >= c.y && p.y <= c.y + c.h;
const mapPoint = <T extends Point>(p: T, c: Rect): T => ({ ...p, x: (p.x - c.x) / c.w, y: (p.y - c.y) / c.h });

/** Interseção do retângulo com a área, já nas coordenadas novas; null se não sobra área. */
function mapRect<T extends Rect>(r: T, c: Rect): T | null {
  const x1 = Math.max(r.x, c.x);
  const y1 = Math.max(r.y, c.y);
  const x2 = Math.min(r.x + r.w, c.x + c.w);
  const y2 = Math.min(r.y + r.h, c.y + c.h);
  if (x2 <= x1 || y2 <= y1) return null;
  return { ...r, x: (x1 - c.x) / c.w, y: (y1 - c.y) / c.h, w: (x2 - x1) / c.w, h: (y2 - y1) / c.h };
}

/** Remapeia as marcações para a imagem recortada em `crop` (coordenadas normalizadas da imagem original) e renumera os marcadores. */
export function cropAnnotations(a: Annotations, crop: Rect): CropResult {
  const markers = [...a.markers].sort((p, q) => p.n - q.n).filter((m) => inside(m, crop)).map((m, i) => ({ ...mapPoint(m, crop), n: i + 1 }));
  const highlights = a.highlights.flatMap((h) => mapRect(h, crop) ?? []);
  const hotspots = a.hotspots.flatMap((h) => mapRect(h, crop) ?? []);
  const arrows = a.arrows
    .filter((r) => inside(r.from, crop) && inside(r.to, crop))
    .map((r) => ({ ...r, from: mapPoint(r.from, crop), to: mapPoint(r.to, crop) }));
  return {
    annotations: { ...a, markers, highlights, arrows, hotspots },
    removed: {
      markers: a.markers.length - markers.length,
      highlights: a.highlights.length - highlights.length,
      arrows: a.arrows.length - arrows.length,
      hotspots: a.hotspots.length - hotspots.length,
    },
  };
}
