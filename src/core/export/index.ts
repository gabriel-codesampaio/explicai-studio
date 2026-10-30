import { copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { atomicWrite, relativePosix, resolveInside } from "../fs.js";
import { updateManual } from "../manuals.js";
import { slugify } from "../text.js";
import type { ManualTheme } from "../types.js";
import { type CollectOptions, collectPages } from "./collect.js";
import { FONTS_DIR, fontFiles } from "./fonts.js";
import { renderHtml } from "./html.js";
import { renderMarkdown } from "./markdown.js";
import { printPdf } from "./pdf.js";
import { type ImageInfo, loadImages } from "./refs.js";
import { mergeTheme, type ThemePatch, usedFonts } from "./theme.js";

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
 * a partir desse HTML) ou Markdown (um arquivo só, para quem lê com IA). Usa a Versão do manual
 * de cada página.
 */
export async function exportManual(dir: string, format: ExportFormat, opts: CollectOptions = {}): Promise<ExportResult> {
  const collected = await collectPages(dir, opts);
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
  await copyFonts(out, collected.meta.theme);
  const html = path.join(out, "index.html");
  await atomicWrite(html, renderHtml(collected, images));
  if (format === "html") return result(html);

  const pdf = path.join(root, `${slugify(collected.meta.title) || "manual"}.pdf`);
  await rm(pdf, { force: true });
  await printPdf(html, pdf);
  return result(pdf);
}

/**
 * Muda a aparência do manual exportado. Só os campos de `patch` mudam (`null` apaga o campo);
 * cores sem contraste suficiente são recusadas.
 */
export async function setManualTheme(dir: string, patch: ThemePatch): Promise<void> {
  await updateManual(dir, (meta) => {
    const theme = mergeTheme(meta.theme, patch);
    if (Object.keys(theme).length) meta.theme = theme;
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

/** Só as fontes que o tema usa vão com o HTML (e a licença OFL de cada uma), para o manual abrir igual sem internet. */
async function copyFonts(out: string, theme: ManualTheme | undefined): Promise<void> {
  await mkdir(path.join(out, "fonts"), { recursive: true });
  for (const font of usedFonts(theme)) {
    for (const name of [...fontFiles(font).map((f) => f.file), `OFL-${font.id}.txt`]) {
      await copyFile(new URL(name, FONTS_DIR), path.join(out, "fonts", name));
    }
  }
}
