import { ExplicaiError } from "../errors.js";
import type { ManualCover } from "../types.js";

export const COVER_MAX = 120;
export const COVER_FIELDS = ["subtitle", "author", "version", "date"] as const;
export type CoverField = (typeof COVER_FIELDS)[number];

const NAMES: Record<CoverField, string> = { subtitle: "subtítulo", author: "autor", version: "versão", date: "data" };

/** Mudança na capa: campo ausente fica como está, `null` ou texto vazio apaga o campo. */
export type CoverPatch = Partial<Record<CoverField, string | null>>;

/** Texto de um campo: aparado, vazio vira `null`; texto acima de `max` é recusado com o motivo. */
export function checkText(value: unknown, label: string, max: number): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw new Error(`O campo ${label} aceita só texto.`);
  const text = value.trim();
  const size = [...text].length;
  if (size > max) {
    throw new ExplicaiError("too-long", `O campo ${label} tem ${size} caracteres; o máximo é ${max}. Encurte o texto.`, {
      label,
      size,
      max,
    });
  }
  return text || null;
}

export function mergeCover(current: ManualCover | undefined, patch: CoverPatch): ManualCover {
  const next: ManualCover = { ...current };
  for (const key of COVER_FIELDS) {
    if (patch[key] === undefined) continue;
    const text = checkText(patch[key], NAMES[key], COVER_MAX);
    if (text === null) delete next[key];
    else next[key] = text;
  }
  return next;
}

/** Linhas da capa na ordem subtítulo, autor, versão, data; campo vazio não entra. */
export function coverLines(cover: ManualCover | undefined): string[] {
  return COVER_FIELDS.map((k) => (typeof cover?.[k] === "string" ? cover[k].trim() : "")).filter(Boolean);
}

/** Texto de usuário em HTML (`<`, `&`, aspas). */
export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Linhas abaixo do título da capa. Vazio quando não há texto: a capa sai como sempre saiu. */
export function coverHtml(cover: ManualCover | undefined): string {
  return coverLines(cover)
    .map((line) => `<p class="cover-line">${escapeHtml(line)}</p>\n`)
    .join("");
}

export const COVER_CSS = ".cover .cover-line{white-space:pre-line;overflow-wrap:anywhere}";
