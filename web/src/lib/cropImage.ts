import type { Rect } from "./annotations";
import { loadImage, redactableType, uploadCanvas } from "./redactImage";

/** Retângulo (frações da imagem) alinhado a pixels inteiros, com ao menos 1 px; é o que o recorte realmente usa. */
export function snapCrop(r: Rect, width: number, height: number): Rect {
  const x0 = Math.min(width - 1, Math.max(0, Math.round(r.x * width)));
  const y0 = Math.min(height - 1, Math.max(0, Math.round(r.y * height)));
  const x1 = Math.min(width, Math.max(x0 + 1, Math.round((r.x + r.w) * width)));
  const y1 = Math.min(height, Math.max(y0 + 1, Math.round((r.y + r.h) * height)));
  return { x: x0 / width, y: y0 / height, w: (x1 - x0) / width, h: (y1 - y0) / height };
}

/**
 * Recorta a imagem no navegador e manda o arquivo menor ao servidor, que troca o original.
 * Devolve o retângulo em pixels inteiros que foi usado, para remapear as marcações pela mesma conta.
 * O canvas recodifica só os pixels: sai sem EXIF e sem bytes sobrando depois do fim do arquivo.
 */
export async function cropImage(slug: string, asset: string, src: string, rect: Rect): Promise<Rect> {
  const type = redactableType(asset);
  if (!type) throw new Error("type");
  const img = await loadImage(src);
  const { naturalWidth: W, naturalHeight: H } = img;
  const snapped = snapCrop(rect, W, H);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(snapped.w * W);
  canvas.height = Math.round(snapped.h * H);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(
    img,
    Math.round(snapped.x * W),
    Math.round(snapped.y * H),
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  await uploadCanvas(slug, asset, src, canvas, type);
  return snapped;
}
