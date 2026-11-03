import type { Rect } from "./annotations";

/** Cor única da tarja (cinza-escuro, opaca). Também é a cor do retângulo no rascunho. */
export const REDACT_RGB = [31, 41, 55] as const;
export const REDACT_CSS = `rgb(${REDACT_RGB.join(",")})`;

interface Pixels {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

/**
 * Pinta no lugar uma tarja sólida opaca em cada retângulo (frações de 0 a 1 da imagem).
 * Arredonda para fora, então a tarja nunca fica menor que o retângulo; o resto dos pixels não muda.
 */
export function paintRedactions<T extends Pixels>(img: T, rects: Rect[]): T {
  for (const r of rects) {
    const x0 = Math.max(0, Math.floor(r.x * img.width));
    const y0 = Math.max(0, Math.floor(r.y * img.height));
    const x1 = Math.min(img.width, Math.ceil((r.x + r.w) * img.width));
    const y1 = Math.min(img.height, Math.ceil((r.y + r.h) * img.height));
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * img.width + x) * 4;
        img.data.set([...REDACT_RGB, 255], i);
      }
    }
  }
  return img;
}
