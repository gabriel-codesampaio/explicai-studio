import { EN } from "./i18n.en";

/**
 * Idioma da interface do Studio. A chave de cada texto é o próprio texto em português:
 * `t("Nova página")`. O inglês vem de i18n.en.ts; texto sem tradução aparece em português.
 * O conteúdo do manual (o "Resultado:" de um passo, o sumário exportado) segue o idioma do manual.
 */
export type Lang = "pt-BR" | "en";

const KEY = "explicai:idioma";

function readLang(): Lang {
  // Os testes rodam sempre em português, qualquer que seja o idioma da máquina.
  if (typeof window === "undefined" || import.meta.env.MODE === "test") return "pt-BR";
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "pt-BR" || saved === "en") return saved;
  } catch {
    // Sem armazenamento: segue o navegador.
  }
  return navigator.language.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
}

export const lang: Lang = readLang();
/** Para Intl (datas, "há 5 minutos") e para o idioma de um manual novo. */
export const locale = lang === "en" ? "en-US" : "pt-BR";

/** Troca o idioma e recarrega: os textos são lidos uma vez, sem precisar redesenhar a tela inteira. */
export function setLang(next: Lang): void {
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Sem armazenamento: vale só nesta aba.
  }
  window.location.reload();
}

/** Texto da interface no idioma escolhido. `{nome}` é trocado pelo valor em `vars`. */
export function t(pt: string, vars?: Record<string, string | number>): string {
  const text = lang === "en" ? (EN[pt] ?? pt) : pt;
  return vars ? text.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? "")) : text;
}

/** Escolhe a forma no singular ou no plural e já preenche `{n}`. */
export function tn(n: number, one: string, many: string, vars?: Record<string, string | number>): string {
  return t(n === 1 ? one : many, { n, ...vars });
}
