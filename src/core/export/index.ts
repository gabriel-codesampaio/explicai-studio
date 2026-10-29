import { copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { atomicWrite, relativePosix, resolveInside } from "../fs.js";
import { updateManual } from "../manuals.js";
import { slugify } from "../text.js";
import type { ManualTheme } from "../types.js";
import { collectPages } from "./collect.js";
import { renderHtml } from "./html.js";
import { renderMarkdown } from "./markdown.js";
import { printPdf } from "./pdf.js";
import { type ImageInfo, loadImages } from "./refs.js";

export { findBrowser } from "./pdf.js";

/** Pasta da exportação, dentro do manual. Cada exportação substitui a anterior do mesmo formato. */
export const EXPORT_DIR = "exportacao";

export type ExportFormat = "html" | "pdf" | "markdown";
export const EXPORT_FORMATS: ExportFormat[] = ["html", "pdf", "markdown"];

export interface ExportResult {
  format: ExportFormat;
  /** Arquivo principal, relativo à pasta do manual (`exportacao/html/index.html`). */
  file: string;
  pages: number;
  /** Páginas que ficaram de fora e por quê. */
  warnings: string[];
}

/**
 * Exporta o manual: HTML (um arquivo com sumário, para publicar ou abrir no navegador), PDF (impresso
 * a partir desse HTML) ou Markdown (um arquivo só, para quem lê com IA). Usa a versão marcada
 * "No manual" de cada página.
 */
export async function exportManual(dir: string, format: ExportFormat): Promise<ExportResult> {
  const collected = await collectPages(dir);
  const images = await loadImages(dir, collected.pages);
  const root = resolveInside(dir, EXPORT_DIR);
  const result = (file: string): ExportResult => ({
    format,
    file: relativePosix(dir, file),
    pages: collected.pages.length,
    warnings: collected.warnings,
  });

  if (format === "markdown") {
    const out = await freshDir(path.join(root, "markdown"));
    await copyImages(dir, images, out);
    const file = path.join(out, "manual.md");
    await atomicWrite(file, renderMarkdown(collected, images));
    return result(file);
  }

  const out = await freshDir(path.join(root, "html"));
  await copyImages(dir, images, out);
  const html = path.join(out, "index.html");
  await atomicWrite(html, renderHtml(collected, images));
  if (format === "html") return result(html);

  const pdf = path.join(root, `${slugify(collected.meta.title) || "manual"}.pdf`);
  await rm(pdf, { force: true });
  await printPdf(html, pdf);
  return result(pdf);
}

/** Cor do manual exportado. Só aceita hexadecimal de 6 dígitos; sem cor, volta à da marca. */
export async function setManualTheme(dir: string, theme: ManualTheme): Promise<void> {
  if (theme.accent !== undefined && !/^#[0-9a-f]{6}$/i.test(theme.accent)) {
    throw new Error("Cor inválida: use o formato #2b4fe0.");
  }
  await updateManual(dir, (meta) => {
    if (theme.accent) meta.theme = { ...meta.theme, accent: theme.accent.toLowerCase() };
    else delete meta.theme;
  });
}

async function freshDir(dir: string): Promise<string> {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  return dir;
}

/** Copia só as imagens usadas, mantendo `assets/` para os caminhos do HTML e do Markdown valerem. */
async function copyImages(dir: string, images: Map<string, ImageInfo>, out: string): Promise<void> {
  await mkdir(path.join(out, "assets"), { recursive: true });
  for (const asset of images.keys()) await copyFile(resolveInside(dir, asset), path.join(out, asset));
}
