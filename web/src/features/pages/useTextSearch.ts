import { useEffect, useState } from "react";
import { api, type TextHit } from "@/lib/api";

export const MIN_TEXT_QUERY = 2;
const DEBOUNCE_MS = 200;

/** Busca no corpo das páginas: a partir de 2 letras, com espera ao digitar e cancelando a consulta velha. */
export function useTextSearch(slug: string | undefined, query: string): { hits: TextHit[]; loading: boolean } {
  const q = query.trim();
  const [state, setState] = useState<{ q: string; hits: TextHit[] }>({ q: "", hits: [] });
  const active = !!slug && q.length >= MIN_TEXT_QUERY;

  useEffect(() => {
    if (!active || !slug) return;
    const ctl = new AbortController();
    const timer = setTimeout(() => {
      api
        .searchText(slug, q, ctl.signal)
        .then((hits) => !ctl.signal.aborted && setState({ q, hits }))
        .catch(() => !ctl.signal.aborted && setState({ q, hits: [] }));
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      ctl.abort();
    };
  }, [active, slug, q]);

  if (!active) return { hits: [], loading: false };
  return { hits: state.q === q ? state.hits : [], loading: state.q !== q };
}
