import type { TreeItem } from "./api";
import { locale, t } from "./i18n";

/** Dias sem conferência a partir dos quais a página entra no filtro (igual ao núcleo). */
export const STALE_DAYS = 90;

const FORMAT = /^\d{4}-\d{2}-\d{2}$/;
const parts = (day: string) => day.split("-").map(Number) as [number, number, number];

/** Hoje no fuso local, como AAAA-MM-DD. */
export function today(now: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/** Sem data, data inválida ou conferida há mais de 90 dias. */
export function isStale(reviewed: string | undefined, now: Date = new Date()): boolean {
  if (!reviewed || !FORMAT.test(reviewed)) return true;
  const [y, m, d] = parts(reviewed);
  const days = (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(y, m - 1, d)) / 86_400_000;
  return !(days <= STALE_DAYS);
}

/** "Conferida em 5 de novembro de 2026", ou "Nunca conferida". */
export function reviewedLabel(reviewed: string | undefined): string {
  if (!reviewed || !FORMAT.test(reviewed)) return t("Nunca conferida");
  const [y, m, d] = parts(reviewed);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(y, m - 1, d));
  return t("Conferida em {data}", { data: date });
}

/** Só as páginas não conferidas, com as mães que as levam; ramo sem nenhuma some. */
export function staleOnly(items: TreeItem[], now: Date = new Date()): TreeItem[] {
  return items.flatMap((i) => {
    const children = staleOnly(i.children, now);
    return isStale(i.reviewed, now) || children.length ? [{ ...i, children }] : [];
  });
}
