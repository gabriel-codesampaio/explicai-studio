import path from "node:path";
import { emptyAnnotations } from "../annotations.js";
import { readAnnotations } from "../assets.js";
import { ExplicaiError } from "../errors.js";
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

const INLINE_LINK = /(?<!!)\[((?:[^[\]]|\[[^\]]*\])*)\]\(\s*<?([^)\s>]*)>?(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g;
const REF_LINK = /(?<!!)\[((?:[^[\]]|\[[^\]]*\])*)\]\[([^\]]*)\]/g;
const REF_DEF = /^ {0,3}\[([^\]]+)\]: *<?([^\s>]+)>?.*$/gm;

/** Nome do arquivo `.md` de um destino de link (`../pages/H.md#x` -> `h.md`), em minúsculas; outro destino: null. */
function mdName(dest: string): string | null {
  const last = dest.split(/[?#]/)[0]?.split(/[/\\]/).pop() ?? "";
  const name = decodeUri(last).toLowerCase();
  return name.endsWith(".md") ? name : null;
}

/**
 * Troca por só o texto todo link (em linha, com título, entre `<>`, com pasta, por referência) que aponta para
 * uma página que o público não vê. `files`: nomes de arquivo em minúsculas. `dropped`: os arquivos citados.
 */
export function stripHiddenLinks(body: string, files: Set<string>): { text: string; dropped: string[] } {
  const dropped: string[] = [];
  const hit = (dest: string) => {
    const name = mdName(dest);
    if (!name || !files.has(name)) return false;
    dropped.push(name);
    return true;
  };
  const labels = new Set<string>();
  let text = body.replace(REF_DEF, (all, label: string, dest: string) => {
    if (!hit(dest)) return all;
    labels.add(label.trim().toLowerCase());
    return "";
  });
  text = text.replace(INLINE_LINK, (all, t: string, dest: string) => (hit(dest) ? t : all));
  if (labels.size)
    text = text.replace(REF_LINK, (all, t: string, ref: string) => (labels.has((ref || t).trim().toLowerCase()) ? t : all));
  return { text, dropped };
}

const IMAGE = /!\[[^\]]*\]\(([^)\s]+)/g;

/** `../assets/tela.png` (como está na página) → `assets/tela.png`. Imagem de fora do manual: null. */
export function assetFromSrc(src: string): string | null {
  if (/^[a-z][a-z0-9+.-]*:/i.test(src)) return null;
  const p = path.posix.normalize(path.posix.join("pages", decodeUri(src)));
  return p.startsWith("assets/") ? p : null;
}

/** Marcações e tamanho de cada imagem do manual usada nas páginas. Imagem apagada fica de fora e vai para `missing`. */
export async function loadImages(
  dir: string,
  pages: ExportPage[],
  missing: string[] = [],
  warnings: string[] = [],
): Promise<Map<string, ImageInfo>> {
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
      let annotations: Annotations | undefined;
      try {
        annotations = await readAnnotations(dir, asset);
      } catch (err) {
        if (!(err instanceof ExplicaiError)) throw err;
        warnings.push(err.message); // imagem pura, sem marcações
      }
      images.set(asset, { asset, size: await imageSize(abs), annotations: annotations ?? emptyAnnotations() });
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

/** Avisos do que sumiu por causa do público: link que virou texto e área clicável removida. */
export function hiddenLinkWarnings(
  pages: ExportPage[],
  hidden: { id: string; fileName: string }[],
  images: Map<string, ImageInfo>,
): string[] {
  if (!hidden.length) return [];
  const files = new Set(hidden.map((h) => h.fileName.toLowerCase()));
  const ids = new Set(hidden.map((h) => h.id));
  const out: string[] = [];
  for (const page of pages) {
    for (const file of stripHiddenLinks(page.body, files).dropped) {
      out.push(`Página "${page.title}": o link para ${file} virou texto (página fora deste público).`);
    }
  }
  for (const { asset, annotations } of images.values()) {
    for (const h of annotations.hotspots) {
      if (h.target.type !== "url" && ids.has(h.target.pageId))
        out.push(`Imagem ${asset}: área clicável para página fora deste público foi removida.`);
    }
  }
  return out;
}
