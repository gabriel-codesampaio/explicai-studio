import { useSyncExternalStore } from "react";

/**
 * Aparência do Studio (claro/escuro e cor de destaque), guardada no navegador de quem usa.
 * O index.html aplica a mesma leitura antes da primeira pintura; mudou a chave ou o formato, mude lá também.
 */

export type Mode = "light" | "dark" | "system";

/** Cores pré-definidas. A primeira é a da marca; as outras trocam o cobalto em tokens.css. */
export const ACCENTS = [
  { id: "cobalto", label: "Cobalto", swatch: "#2b4fe0" },
  { id: "esmeralda", label: "Esmeralda", swatch: "#0f7a55" },
  { id: "ameixa", label: "Ameixa", swatch: "#7a3fc4" },
  { id: "grafite", label: "Grafite", swatch: "#3d4459" },
] as const;

export type Accent = (typeof ACCENTS)[number]["id"];

export interface Appearance {
  mode: Mode;
  accent: Accent;
}

const KEY = "explicai:aparencia";
const DEFAULT: Appearance = { mode: "system", accent: "cobalto" };
const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

export function readAppearance(): Appearance {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Appearance>;
    return {
      mode: saved.mode === "light" || saved.mode === "dark" ? saved.mode : DEFAULT.mode,
      accent: ACCENTS.some((a) => a.id === saved.accent) ? (saved.accent as Accent) : DEFAULT.accent,
    };
  } catch {
    return DEFAULT;
  }
}

export function applyAppearance({ mode, accent }: Appearance): void {
  const root = document.documentElement;
  root.dataset.theme = mode === "dark" || (mode === "system" && systemDark()) ? "dark" : "light";
  root.dataset.accent = accent;
}

export function saveAppearance(next: Appearance): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Navegador sem armazenamento (janela privada): vale só até fechar a aba.
  }
  applyAppearance(next);
}

/** No modo "do sistema", acompanha quando o sistema troca de claro para escuro. */
export function followSystemTheme(): void {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => applyAppearance(readAppearance()));
}

/** Tema em uso agora ("light" ou "dark"), para componentes que não leem os tokens do CSS. */
export function useResolvedTheme(): "light" | "dark" {
  return useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      return () => observer.disconnect();
    },
    () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"),
  );
}
