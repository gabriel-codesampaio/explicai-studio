import { useSyncExternalStore } from "react";

/**
 * Aparência do Studio (claro/escuro), guardada no navegador de quem usa.
 * O index.html aplica a mesma leitura antes da primeira pintura; mudou a chave ou o formato, mude lá também.
 */

export type Mode = "light" | "dark" | "system";

export interface Appearance {
  mode: Mode;
}

const KEY = "explicai:aparencia";
const DEFAULT: Appearance = { mode: "system" };
const systemDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

export function readAppearance(): Appearance {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Appearance>;
    // Gravações antigas trazem também "accent"; o Studio agora é sempre cobalto e ignora o campo.
    return { mode: saved.mode === "light" || saved.mode === "dark" ? saved.mode : DEFAULT.mode };
  } catch {
    return DEFAULT;
  }
}

export function applyAppearance({ mode }: Appearance): void {
  const root = document.documentElement;
  root.dataset.theme = mode === "dark" || (mode === "system" && systemDark()) ? "dark" : "light";
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
