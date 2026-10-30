import path from "node:path";
import { readAnnotations } from "../assets.js";
import { exists, resolveInside } from "../fs.js";
import { decodeUri, slugify } from "../text.js";
import type { Annotations } from "../types.js";
import type { ExportPage } from "./collect.js";
import { imageSize, type Size } from "./imageSize.js";

export interface ImageInfo {
  /** Caminho no manual: `assets/tela.png`. */
  asset: string;
  size: Size | null;
  annotations: Annotations;
}

const IMAGE = /!\[[^\]]*\]\(([^)\s]+)/g;

/** `../assets/tela.png` (como está na página) → `assets/tela.png`. Imagem de fora do manual: null. */
export function assetFromSrc(src: string): string | null {
  if (/^[a-z][a-z0-9+.-]*:/i.test(src)) return null;
  const p = path.posix.normalize(path.posix.join("pages", decodeUri(src)));
  return p.startsWith("assets/") ? p : null;
}

/** Marcações e tamanho de cada imagem do manual usada nas páginas. Imagem apagada fica de fora e vai para `missing`. */
export async function loadImages(dir: string, pages: ExportPage[], missing: string[] = []): Promise<Map<string, ImageInfo>> {
  const images = new Map<string, ImageInfo>();
  for (const page of pages) {
    for (const [, src] of page.body.matchAll(IMAGE)) {
      const asset = src && assetFromSrc(src);
      if (!asset || images.has(asset) || missing.includes(asset)) continue;
      const abs = resolveInside(dir, asset);
      if (!(await exists(abs))) {
        missing.push(asset);
        continue;
      }
      images.set(asset, { asset, size: await imageSize(abs), annotations: await readAnnotations(dir, asset) });
    }
  }
  return images;
}

/** Id da seção de uma página no manual exportado. */
export const pageAnchor = (pageId: string) => `p-${pageId}`;
/** Id de um título dentro de uma página: `#secao` de um link vira este id. */
export const headingAnchor = (pageId: string, text: string) => `p-${pageId}--${slugify(text)}`;

/**
 * Link entre páginas (`./arquivo.md` ou `./arquivo.md#secao`) → âncora dentro do manual exportado.
 * Outro tipo de link: null (fica como está).
 */
export function pageLink(href: string, pages: ExportPage[]): string | null {
  const m = /^(?:\.\/)?([^/#?]+\.md)(?:#(.+))?$/.exec(href);
  if (!m) return null;
  const page = pages.find((p) => p.fileName === decodeUri(m[1] ?? ""));
  if (!page) return null;
  return `#${m[2] ? headingAnchor(page.id, decodeUri(m[2])) : pageAnchor(page.id)}`;
}

/** Só endereços seguros saem como link no manual exportado. */
export function safeHref(href: string): string | null {
  if (/^(#|mailto:|https?:\/\/)/i.test(href)) return href;
  return null;
}
