import { type Annotations, FORMAT_VERSION, type HotspotTarget, type Point, type Rect } from "./types.js";

export function emptyAnnotations(): Annotations {
  return { version: FORMAT_VERSION, markers: [], highlights: [], arrows: [], hotspots: [] };
}

/**
 * Valida anotações vindas do disco ou do Agent. Lança Error com o caminho do campo inválido.
 * Coordenadas fora de 0..1 são rejeitadas para que nada aponte para fora da imagem.
 */
export function parseAnnotations(input: unknown): Annotations {
  const obj = record(input, "anotações");
  if (obj.version !== FORMAT_VERSION) throw new Error(`anotações.version: esperado ${FORMAT_VERSION}`);

  const ids = new Set<string>();
  const id = (v: unknown, path: string) => {
    const s = text(v, path);
    if (ids.has(s)) throw new Error(`${path}: id repetido "${s}"`);
    ids.add(s);
    return s;
  };

  return {
    version: FORMAT_VERSION,
    markers: list(obj.markers, "markers").map((m, i) => {
      const r = record(m, `markers[${i}]`);
      const n = r.n;
      if (!Number.isInteger(n) || (n as number) < 1) throw new Error(`markers[${i}].n: inteiro a partir de 1`);
      return {
        id: id(r.id, `markers[${i}].id`),
        n: n as number,
        ...point(r, `markers[${i}]`),
        ...(r.label === undefined ? {} : { label: text(r.label, `markers[${i}].label`, true) }),
      };
    }),
    highlights: list(obj.highlights, "highlights").map((h, i) => {
      const r = record(h, `highlights[${i}]`);
      return { id: id(r.id, `highlights[${i}].id`), ...rect(r, `highlights[${i}]`) };
    }),
    arrows: list(obj.arrows, "arrows").map((a, i) => {
      const r = record(a, `arrows[${i}]`);
      return {
        id: id(r.id, `arrows[${i}].id`),
        from: point(record(r.from, `arrows[${i}].from`), `arrows[${i}].from`),
        to: point(record(r.to, `arrows[${i}].to`), `arrows[${i}].to`),
      };
    }),
    hotspots: list(obj.hotspots, "hotspots").map((h, i) => {
      const r = record(h, `hotspots[${i}]`);
      return {
        id: id(r.id, `hotspots[${i}].id`),
        ...rect(r, `hotspots[${i}]`),
        target: target(r.target, `hotspots[${i}].target`),
      };
    }),
  };
}

function target(v: unknown, path: string): HotspotTarget {
  const r = record(v, path);
  switch (r.type) {
    case "page":
      return { type: "page", pageId: text(r.pageId, `${path}.pageId`) };
    case "anchor":
      return { type: "anchor", pageId: text(r.pageId, `${path}.pageId`), anchor: text(r.anchor, `${path}.anchor`) };
    case "url": {
      const href = text(r.href, `${path}.href`);
      // Só http(s) e mailto: um href "javascript:" viraria XSS no HTML exportado.
      if (!/^(https?:|mailto:)/i.test(href)) throw new Error(`${path}.href: use http, https ou mailto`);
      return { type: "url", href };
    }
    default:
      throw new Error(`${path}.type: esperado "page", "anchor" ou "url"`);
  }
}

function point(r: Record<string, unknown>, path: string): Point {
  return { x: unit(r.x, `${path}.x`), y: unit(r.y, `${path}.y`) };
}

function rect(r: Record<string, unknown>, path: string): Rect {
  const box = { ...point(r, path), w: unit(r.w, `${path}.w`), h: unit(r.h, `${path}.h`) };
  if (box.w === 0 || box.h === 0) throw new Error(`${path}: largura e altura maiores que zero`);
  if (box.x + box.w > 1 + 1e-9 || box.y + box.h > 1 + 1e-9) throw new Error(`${path}: a área passa da borda da imagem`);
  return box;
}

function unit(v: unknown, path: string): number {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1) throw new Error(`${path}: número entre 0 e 1`);
  return v;
}

function text(v: unknown, path: string, allowEmpty = false): string {
  if (typeof v !== "string" || (!allowEmpty && v.trim() === "")) throw new Error(`${path}: texto obrigatório`);
  return v;
}

function list(v: unknown, path: string): unknown[] {
  if (v === undefined) return [];
  if (!Array.isArray(v)) throw new Error(`${path}: esperado uma lista`);
  return v;
}

function record(v: unknown, path: string): Record<string, unknown> {
  if (typeof v !== "object" || v === null || Array.isArray(v)) throw new Error(`${path}: esperado um objeto`);
  return v as Record<string, unknown>;
}
