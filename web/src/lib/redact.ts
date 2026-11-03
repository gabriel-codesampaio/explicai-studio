import {
  type Annotations,
  addShape,
  emptyAnnotations,
  type Handle,
  type Highlight,
  moveAnnotation,
  type Point,
  type Rect,
} from "./annotations";

/** Cor única da tarja (nanquim da marca, opaca). Também é a cor do retângulo no rascunho. */
export const REDACT_RGB = [21, 26, 51] as const;
export const REDACT_CSS = `rgb(${REDACT_RGB.join(",")})`;

/** Estilo da ocultação: tarja sólida ou pixelado + borrado, sempre queimado nos pixels. */
export type RedactStyle = "bar" | "blur";

const STYLE_KEY = "explicai:ocultar-estilo";
export function readRedactStyle(): RedactStyle {
  try {
    return localStorage.getItem(STYLE_KEY) === "blur" ? "blur" : "bar";
  } catch {
    return "bar";
  }
}
export function saveRedactStyle(style: RedactStyle) {
  try {
    localStorage.setItem(STYLE_KEY, style);
  } catch {
    // sem armazenamento: vale só nesta sessão
  }
}

interface Pixels {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

/** Lado do bloco do pixelado: no mínimo 12 px e 1/4 da altura da área. */
export const blurBlock = (heightPx: number) => Math.max(12, Math.ceil(heightPx / 4));

/** Pixela (média por bloco) e borra por cima (caixa, raio ~1/3 do bloco), só dentro da área. Opaco. */
function blurArea(img: Pixels, x0: number, y0: number, x1: number, y1: number) {
  const w = x1 - x0;
  const h = y1 - y0;
  const block = blurBlock(h);
  const cur = new Float32Array(w * h * 3);
  for (let by = 0; by < h; by += block) {
    for (let bx = 0; bx < w; bx += block) {
      const ex = Math.min(w, bx + block);
      const ey = Math.min(h, by + block);
      const sum = [0, 0, 0];
      for (let y = by; y < ey; y++)
        for (let x = bx; x < ex; x++) for (let c = 0; c < 3; c++) sum[c]! += img.data[((y0 + y) * img.width + x0 + x) * 4 + c]!;
      const n = (ex - bx) * (ey - by);
      for (let y = by; y < ey; y++)
        for (let x = bx; x < ex; x++) for (let c = 0; c < 3; c++) cur[(y * w + x) * 3 + c] = sum[c]! / n;
    }
  }
  const r = Math.max(1, Math.floor(block / 3));
  const pass = (src: Float32Array, horizontal: boolean) => {
    const out = new Float32Array(src.length);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const [pos, len] = horizontal ? [x, w] : [y, h];
        const a = Math.max(0, pos - r);
        const b = Math.min(len - 1, pos + r);
        for (let c = 0; c < 3; c++) {
          let s = 0;
          for (let k = a; k <= b; k++) s += src[(horizontal ? y * w + k : k * w + x) * 3 + c]!;
          out[(y * w + x) * 3 + c] = s / (b - a + 1);
        }
      }
    }
    return out;
  };
  const done = pass(pass(cur, true), false);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = ((y0 + y) * img.width + x0 + x) * 4;
      for (let c = 0; c < 3; c++) img.data[i + c] = Math.round(done[(y * w + x) * 3 + c]!);
      img.data[i + 3] = 255;
    }
}

/**
 * Pinta no lugar uma tarja sólida opaca em cada retângulo (frações de 0 a 1 da imagem).
 * Arredonda para fora, então a tarja nunca fica menor que o retângulo; o resto dos pixels não muda.
 */
export function paintRedactions<T extends Pixels>(img: T, rects: Rect[], style: RedactStyle = "bar"): T {
  for (const r of rects) {
    const x0 = Math.max(0, Math.floor(r.x * img.width));
    const y0 = Math.max(0, Math.floor(r.y * img.height));
    const x1 = Math.min(img.width, Math.ceil((r.x + r.w) * img.width));
    const y1 = Math.min(img.height, Math.ceil((r.y + r.h) * img.height));
    if (style === "blur") {
      if (x1 > x0 && y1 > y0) blurArea(img, x0, y0, x1, y1);
      continue;
    }
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * img.width + x) * 4;
        img.data.set([...REDACT_RGB, 255], i);
      }
    }
  }
  return img;
}

/**
 * Retângulos a ocultar ficam à parte das marcações (só na memória do editor, nunca no JSON).
 * Reaproveitam a geometria dos destaques: criar, mover e redimensionar são as mesmas contas.
 */
const asAnnotations = (highlights: Highlight[]): Annotations => ({ ...emptyAnnotations(), highlights });

export function addRedaction(list: Highlight[], a: Point, b: Point): Highlight[] | null {
  return addShape(asAnnotations(list), "highlight", a, b, { type: "url", href: "" })?.highlights ?? null;
}

export function moveRedaction(list: Highlight[], id: string, handle: Handle, dx: number, dy: number): Highlight[] {
  return moveAnnotation(asAnnotations(list), id, handle, dx, dy).highlights;
}
