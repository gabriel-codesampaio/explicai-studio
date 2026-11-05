/** Dias sem conferência a partir dos quais a página aparece como "não conferida". */
export const STALE_DAYS = 90;

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `AAAA-MM-DD` de um dia que existe no calendário (2026-02-31 não vale). */
export function isReviewedDate(value: unknown): value is string {
  const m = typeof value === "string" ? DAY.exec(value) : null;
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

/** Sem data, ou conferida há mais de 90 dias (contando o dia de hoje no fuso local). */
export function isStale(reviewed: string | undefined, now: Date = new Date()): boolean {
  if (!reviewed || !isReviewedDate(reviewed)) return true;
  const [y, m, d] = reviewed.split("-").map(Number) as [number, number, number];
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return (today - Date.UTC(y, m - 1, d)) / 86_400_000 > STALE_DAYS;
}
