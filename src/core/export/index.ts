import { randomUUID } from "node:crypto";
import { copyFile, mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { saveAsset } from "../assets.js";
import { ExplicaiError } from "../errors.js";
import { atomicWrite, relativePosix, resolveInside, resolveInsideReal } from "../fs.js";
import { updateManual } from "../manuals.js";
import { slugify } from "../text.js";
import type { ManualTheme } from "../types.js";
import { type CollectOptions, collectPages } from "./collect.js";
import { FONTS_DIR, fontFiles } from "./fonts.js";
import { renderHtml } from "./html.js";
import { checkLogoFile, checkLogoPath, LOGO_EXT, LOGO_MAX_BYTES, logoSizeError, logoTypeError } from "./logo.js";
import { renderMarkdown } from "./markdown.js";
import { printPdf } from "./pdf.js";
import { hiddenLinkWarnings, type ImageInfo, loadImages } from "./refs.js";
import { mergeTheme, type ThemePatch, usedFonts } from "./theme.js";

export { logoSizeError } from "./logo.js";
export { findBrowser } from "./pdf.js";

/** Pasta da exportação, dentro do manual. Cada exportação substitui a anterior do mesmo formato e perfil. */
export const EXPORT_DIR = "exportacao";

export type ExportFormat = "html" | "pdf" | "markdown";
export const EXPORT_FORMATS: ExportFormat[] = ["html", "pdf", "markdown"];

export interface ExportResult {
  format: ExportFormat;
  /** Arquivo principal, relativo à pasta do manual (`exportacao/html/index.html`). */
  file: string;
  pages: number;
  /** Perfil do export, quando houve filtro. HTML, Markdown e PDF levam o perfil no nome da pasta ou do arquivo. */
  audience?: string;
  /** Páginas que ficaram de fora e imagens que não existem, com o motivo. */
  warnings: string[];
}

/**
 * Exporta o manual: HTML (um arquivo com sumário, para publicar ou abrir no navegador), PDF (impresso
 * a partir desse HTML) ou Markdown (um arquivo só, para quem lê com IA). Usa a Versão do manual
 * de cada página.
 */
export async function exportManual(dir: string, format: ExportFormat, opts: CollectOptions = {}): Promise<ExportResult> {
  const collected = await collectPages(dir, opts);
  if (opts.onlyApproved && collected.pages.length === 0) {
    throw new ExplicaiError(
      "no-approved-pages",
      opts.audience
        ? `Nenhuma página aprovada ou publicada é visível para o público "${opts.audience.trim()}".`
        : "Nenhuma página está aprovada ou publicada. Aprove uma página ou exporte todas.",
    );
  }
  const missing: string[] = [];
  const broken: string[] = [];
  const images = await loadImages(dir, collected.pages, missing, broken);
  const warnings = [
    ...collected.warnings,
    ...hiddenLinkWarnings(collected.pages, collected.hidden, images),
    ...missing.map((asset) => `Imagem não encontrada: ${asset}`),
    ...broken,
  ];
  if (opts.audience && collected.pages.length === 0) {
    warnings.push(`O público "${opts.audience.trim()}" não vê nenhuma página: o manual saiu vazio.`);
  }
  const root = resolveInside(dir, EXPORT_DIR);
  // Com perfil, cada um tem a sua pasta (html-cliente), para um export não apagar o do outro (T-134).
  const profile = opts.audience?.trim() ? `-${slugify(opts.audience) || "publico"}` : "";
  const result = (file: string): ExportResult => ({
    format,
    file: relativePosix(dir, file),
    pages: collected.pages.length,
    ...(opts.audience?.trim() ? { audience: opts.audience.trim() } : {}),
    warnings,
  });

  if (format === "markdown") {
    const out = await buildThenSwap(path.join(root, `markdown${profile}`), async (tmp) => {
      await copyImages(dir, images, tmp);
      await atomicWrite(path.join(tmp, "manual.md"), renderMarkdown(collected, images));
    });
    return result(path.join(out, "manual.md"));
  }

  const out = await buildThenSwap(path.join(root, `html${profile}`), async (tmp) => {
    await copyImages(dir, images, tmp);
    await copyFonts(tmp, collected.meta.theme);
    const logo = await copyLogo(dir, tmp, collected.meta.theme, warnings);
    await atomicWrite(path.join(tmp, "index.html"), renderHtml(collected, images, logo));
  });
  const html = path.join(out, "index.html");
  if (format === "html") return result(html);

  const pdf = path.join(root, `${slugify(collected.meta.title) || "manual"}${profile}.pdf`);
  await rm(pdf, { force: true });
  await printPdf(html, pdf);
  return result(pdf);
}

/**
 * Muda a aparência do manual exportado. Só os campos de `patch` mudam (`null` apaga o campo);
 * cores sem contraste suficiente são recusadas.
 */
export async function setManualTheme(dir: string, patch: ThemePatch): Promise<void> {
  if (typeof patch.logo === "string") await checkLogoFile(dir, checkLogoPath(patch.logo));
  await updateManual(dir, (meta) => {
    const theme = mergeTheme(meta.theme, patch);
    if (Object.keys(theme).length) meta.theme = theme;
    else delete meta.theme;
  });
}

/** Grava o logo em `assets/` (PNG, JPG ou SVG, até 1 MB) e o põe no tema. Devolve o caminho. */
export async function setManualLogo(dir: string, fileName: string, data: Uint8Array): Promise<string> {
  if (!LOGO_EXT.test(path.extname(fileName))) throw logoTypeError();
  if (data.byteLength > LOGO_MAX_BYTES) throw logoSizeError();
  const logo = await saveAsset(dir, fileName, data);
  try {
    await setManualTheme(dir, { logo });
  } catch (err) {
    await rm(resolveInside(dir, logo), { force: true }); // não deixa o arquivo novo órfão
    throw err;
  }
  return logo;
}

/** Gera em pasta temporária ao lado e só no fim troca pela `final`: se algo falhar, a exportação anterior fica intacta. */
async function buildThenSwap(final: string, build: (tmp: string) => Promise<void>): Promise<string> {
  const tmp = path.join(path.dirname(final), `.${path.basename(final)}-${randomUUID()}`);
  await mkdir(tmp, { recursive: true });
  try {
    await build(tmp);
    // Antigo vai para o lado, não para o lixo: se o rename falhar (EBUSY no Windows), ele volta.
    const old = `${tmp}.old`;
    const hadOld = await rename(final, old).then(
      () => true,
      () => false,
    );
    try {
      await rename(tmp, final);
    } catch (err) {
      if (hadOld) await rename(old, final).catch(() => undefined);
      throw err;
    }
    if (hadOld) await rm(old, { recursive: true, force: true });
  } catch (err) {
    await rm(tmp, { recursive: true, force: true });
    throw err;
  }
  return final;
}

/** Copia só as imagens usadas, mantendo `assets/` para os caminhos do HTML e do Markdown valerem. */
async function copyImages(dir: string, images: Map<string, ImageInfo>, out: string): Promise<void> {
  await mkdir(path.join(out, "assets"), { recursive: true });
  for (const asset of images.keys()) await copyFile(await resolveInsideReal(dir, asset), path.join(out, asset));
}

/** Copia o logo do tema. Sumiu do disco: avisa e o manual sai sem ele. */
async function copyLogo(dir: string, out: string, theme: ManualTheme | undefined, warnings: string[]): Promise<string | null> {
  if (!theme?.logo) return null;
  try {
    const logo = checkLogoPath(theme.logo);
    await copyFile(await resolveInsideReal(dir, logo), path.join(out, logo));
    return logo;
  } catch (err) {
    const missing = (err as NodeJS.ErrnoException).code === "ENOENT";
    warnings.push(missing ? `Logo não encontrado: ${theme.logo}` : `Logo não copiado (${theme.logo}): ${(err as Error).message}`);
    return null;
  }
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
