import type { Rect } from "./annotations";
import { api } from "./api";
import { paintRedactions, type RedactStyle } from "./redact";

const TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };

/** Tipo que dá para tarjar, ou null (SVG tem texto e GIF perderia quadros: a interface recusa). */
export const redactableType = (asset: string): string | null => TYPES[asset.split(".").pop()?.toLowerCase() ?? ""] ?? null;

export const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });

/**
 * Pinta as tarjas nos pixels da imagem no navegador e manda o arquivo novo ao servidor, que troca
 * o original. O canvas recodifica só os pixels: sai sem EXIF e sem bytes sobrando depois do fim do arquivo.
 */
export async function redactImage(
  slug: string,
  asset: string,
  src: string,
  rects: Rect[],
  style: RedactStyle = "bar",
): Promise<void> {
  const type = redactableType(asset);
  if (!type) throw new Error("type");
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(img, 0, 0);
  ctx.putImageData(paintRedactions(ctx.getImageData(0, 0, canvas.width, canvas.height), rects, style), 0, 0);
  await uploadCanvas(slug, asset, src, canvas, type);
}

/** Grava o canvas no lugar da imagem (troca temp+rename no servidor) e renova as cópias do navegador. */
export async function uploadCanvas(
  slug: string,
  asset: string,
  src: string,
  canvas: HTMLCanvasElement,
  type: string,
  quality = 0.95,
) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  // Navegador que não sabe gravar o formato devolve PNG: gravar isso no lugar de um .webp quebraria a imagem.
  if (blob?.type !== type) throw new Error("encode");
  await api.redactAsset(slug, asset, blob);
  await refreshImage(src);
}

/** O navegador guarda as imagens de assets/ por uma hora: renova a cópia e refaz as <img> já na tela. */
export async function refreshImage(src: string) {
  await fetch(src, { cache: "reload" });
  for (const el of document.querySelectorAll<HTMLImageElement>("img")) if (el.getAttribute("src") === src) el.src = src;
}
