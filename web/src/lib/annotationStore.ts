import { useEffect, useSyncExternalStore } from "react";
import type { Annotations } from "./annotations";
import { api } from "./api";

/**
 * Cache das marcações por imagem. As imagens no editor leem daqui e se atualizam sozinhas
 * quando o editor de marcações grava (sem recarregar a página).
 */
const cache = new Map<string, Annotations | null>();
const listeners = new Set<() => void>();
const keyOf = (slug: string, asset: string) => `${slug}|${asset}`;

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function load(slug: string, asset: string) {
  const key = keyOf(slug, asset);
  if (cache.has(key)) return;
  cache.set(key, null); // evita buscar duas vezes enquanto a primeira não volta
  try {
    cache.set(key, await api.getAnnotations(slug, asset));
  } catch {
    cache.delete(key);
  }
  emit();
}

export async function saveAnnotations(slug: string, asset: string, annotations: Annotations): Promise<void> {
  cache.set(keyOf(slug, asset), await api.saveAnnotations(slug, asset, annotations));
  emit();
}

/** Marcações da imagem, ou null enquanto carrega. */
export function useAnnotations(slug: string, asset: string | null): Annotations | null {
  useEffect(() => {
    if (asset) void load(slug, asset);
  }, [slug, asset]);
  return useSyncExternalStore(subscribe, () => (asset ? (cache.get(keyOf(slug, asset)) ?? null) : null));
}
