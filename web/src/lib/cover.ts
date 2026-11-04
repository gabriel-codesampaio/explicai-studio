import type { ManualCover } from "./api";

/** Espelha src/core/export/cover.ts e footer.ts (o web não importa de src/); web/test/cover.test.ts confere. */
export const COVER_MAX = 120;
export const FOOTER_MAX = 100;
export const COVER_FIELDS = ["subtitle", "author", "version", "date"] as const;

/** Linhas da capa na ordem do export: subtítulo, autor, versão, data. Campo vazio não entra. */
export const coverLines = (cover: ManualCover | undefined): string[] =>
  COVER_FIELDS.map((k) => cover?.[k]?.trim() ?? "").filter(Boolean);

/** Sugestão de data que a pessoa aceita com um clique; nunca preenche sozinha. */
export function suggestDate(locale: string, now = new Date()): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(now);
}
