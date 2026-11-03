import type { Rect } from "./annotations";
import { api } from "./api";
import { paintRedactions } from "./redact";

const TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };

/** Tipo que dá para tarjar, ou null (SVG tem texto e GIF perderia quadros: a interface recusa). */
export const redactableType = (asset: string): string | null => TYPES[asset.split(".").pop()?.toLowerCase() ?? ""] ?? null;

const loadImage = (src: string) =>
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
export async function redactImage(slug: string, asset: string, src: string, rects: Rect[]): Promise<void> {
  const type = redactableType(asset);
  if (!type) throw new Error("type");
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(img, 0, 0);
  ctx.putImageData(paintRedactions(ctx.getImageData(0, 0, canvas.width, canvas.height), rects), 0, 0);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.95));
  // Navegador que não sabe gravar o formato devolve PNG: gravar isso no lugar de um .webp quebraria a imagem.
  if (blob?.type !== type) throw new Error("encode");
  await api.redactAsset(slug, asset, blob);
  // O navegador guarda as imagens de assets/ por uma hora: renova a cópia e refaz as <img> já na tela.
  await fetch(src, { cache: "reload" });
  for (const el of document.querySelectorAll<HTMLImageElement>("img")) if (el.getAttribute("src") === src) el.src = src;
}
