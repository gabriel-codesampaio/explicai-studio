import type { ManualFooter } from "../types.js";
import { checkText, escapeHtml } from "./cover.js";

export const FOOTER_MAX = 100;

/** Mudança no rodapé: campo ausente fica como está, `null` apaga o campo. */
export interface FooterPatch {
  text?: string | null;
  pageNumbers?: boolean | null;
}

export function mergeFooter(current: ManualFooter | undefined, patch: FooterPatch): ManualFooter {
  const next: ManualFooter = { ...current };
  if (patch.text !== undefined) {
    const text = checkText(patch.text, "texto do rodapé", FOOTER_MAX);
    if (text === null) delete next.text;
    else next.text = text;
  }
  if (patch.pageNumbers !== undefined) {
    if (patch.pageNumbers !== null && typeof patch.pageNumbers !== "boolean") throw new Error("pageNumbers aceita true, false ou null.");
    if (patch.pageNumbers) next.pageNumbers = true;
    else delete next.pageNumbers;
  }
  return next;
}

/** Texto de usuário dentro de string CSS entre aspas. `<` sai como escape para nunca fechar o `<style>`. */
export const cssString = (s: string) =>
  `"${s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/</g, "\\3C ")
    .replace(/\r\n|\r|\n/g, "\\A ")}"`;

/** Linha de texto do rodapé na tela (HTML). Em papel o texto vai na margem de cada página. */
export const footerHtml = (footer: ManualFooter | undefined): string =>
  footer?.text?.trim() ? `<p class="foot-text">${escapeHtml(footer.text.trim())}</p>` : "";

export const FOOTER_CSS = ".foot-text{margin:0 0 8px;white-space:pre-line;overflow-wrap:anywhere}";

/**
 * Rodapé de cada página do PDF por margem de página (Chrome 131 ou mais novo): texto à esquerda, "n / total"
 * à direita, nenhum dos dois na capa. Cor fixa: variável CSS não vale nas margens.
 */
export function footerPageCss(footer: ManualFooter | undefined, color: string): string {
  const text = footer?.text?.trim();
  if (!text && !footer?.pageNumbers) return "";
  const box = `font:9pt Archivo,sans-serif;color:${color}`;
  const left = text ? `@bottom-left{content:${cssString(text)};${box};white-space:pre-line}` : "";
  const right = footer?.pageNumbers ? `@bottom-right{content:counter(page) " / " counter(pages);${box}}` : "";
  return `@page{${left}${right}}@page:first{@bottom-left{content:none}@bottom-right{content:none}}`;
}
