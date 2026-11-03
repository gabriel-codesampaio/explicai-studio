import { loadImage, redactableType, uploadCanvas } from "./redactImage";

/** Largura máxima sugerida. O Studio só sugere; quem aplica é a pessoa. */
export const SUGGESTED_WIDTH = 1600;

/** Tamanho depois de reduzir para `width` mantendo a proporção, ou null se não for menor (nunca amplia). */
export function reducedSize(w: number, h: number, width: number): { w: number; h: number } | null {
  const target = Math.floor(width);
  if (!(target >= 1) || target >= w) return null;
  return { w: target, h: Math.max(1, Math.round((h * target) / w)) };
}

/** Só JPEG e WebP aceitam ajuste de qualidade; PNG só perde pixels. */
export const hasQuality = (asset: string) => /^image\/(jpeg|webp)$/.test(redactableType(asset) ?? "");

function render(img: HTMLImageElement, size: { w: number; h: number }): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, size.w, size.h);
  return canvas;
}

/** Peso estimado, em bytes, da imagem reduzida (codifica no navegador, sem gravar). */
export async function previewBytes(asset: string, src: string, width: number, quality: number): Promise<number | null> {
  const type = redactableType(asset);
  if (!type) return null;
  const img = await loadImage(src);
  const size = reducedSize(img.naturalWidth, img.naturalHeight, width);
  if (!size) return null;
  const canvas = render(img, size);
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, type, quality));
  return blob?.type === type ? blob.size : null;
}

/**
 * Reduz a largura no navegador e manda o arquivo menor ao servidor, que troca o original
 * (mesmo caminho, mesmo formato). As marcações são frações da imagem: seguem sobre o mesmo pixel.
 */
export async function reduceImage(slug: string, asset: string, src: string, width: number, quality: number): Promise<void> {
  const type = redactableType(asset);
  if (!type) throw new Error("type");
  const img = await loadImage(src);
  const size = reducedSize(img.naturalWidth, img.naturalHeight, width);
  if (!size) throw new Error("size");
  await uploadCanvas(slug, asset, src, render(img, size), type, quality);
}
