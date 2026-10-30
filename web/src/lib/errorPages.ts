/** Lógica das páginas de erro (sem React): destaque no título, tipo do erro e código copiável. */

import { ApiError, isOffline } from "./api";

export interface TitlePart {
  text: string;
  /** Vai no marca-texto. */
  mark: boolean;
}

/** "Não achamos *esta página*" vira três partes; o trecho entre asteriscos leva o marca-texto. */
export function splitHighlight(title: string): TitlePart[] {
  return title
    .split(/\*([^*]+)\*/)
    .map((text, i) => ({ text, mark: i % 2 === 1 }))
    .filter((p) => p.text);
}

/** O título sem os asteriscos, para <title> e leitor de tela. */
export const plainTitle = (title: string): string => title.replaceAll("*", "");

export type ErrorKind = "forbidden" | "offline" | "server";

export function errorKind(err: unknown): ErrorKind {
  if (isOffline(err)) return "offline";
  if (err instanceof ApiError && err.code?.startsWith("forbidden")) return "forbidden";
  return "server";
}

/** Código curto para copiar num relato: "HTTP 502" quando o proxy respondeu, "fetch failed" quando nem chegou. */
export function technicalCode(err: unknown): string {
  if (isOffline(err) && err instanceof ApiError) return err.status ? `HTTP ${err.status}` : "fetch failed";
  if (err instanceof ApiError && err.status) return [`HTTP ${err.status}`, err.code].filter(Boolean).join(" ");
  return err instanceof Error ? `${err.name}: ${err.message}` : String(err);
}
