export interface PixelSize {
  w: number;
  h: number;
}

/**
 * Acima disso a proporção mudou o bastante para as marcações (coordenadas relativas) saírem do lugar.
 * Medido: 2% de 1280 px de largura são ~26 px, quase um marcador (24 px); 5% já seriam ~64 px.
 */
export const ASPECT_LIMIT = 0.02;

/** A proporção largura/altura mudou mais que o limite? Tamanho desconhecido conta como mudou. */
export function aspectChanged(before: PixelSize, after: PixelSize): boolean {
  if (before.w <= 0 || before.h <= 0 || after.w <= 0 || after.h <= 0) return true;
  return Math.abs(after.w / after.h / (before.w / before.h) - 1) > ASPECT_LIMIT;
}
