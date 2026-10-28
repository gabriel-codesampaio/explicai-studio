import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage, type PagePatch } from "../lib/api";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface Job {
  slug: string;
  id: string;
  patch: PagePatch;
}

/**
 * Junta as mudanças de uma página e grava `delay` ms depois da última. `flush` grava na hora,
 * e é chamado antes de trocar de página para nada ficar para trás.
 */
export function useAutosave(save: (job: Job) => Promise<unknown>, onError: (message: string) => void, delay = 600) {
  const [state, setState] = useState<SaveState>("idle");
  const pending = useRef<Job | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const deps = useRef({ save, onError });
  deps.current = { save, onError };

  const flush = useCallback(async () => {
    window.clearTimeout(timer.current);
    const job = pending.current;
    pending.current = null;
    if (!job) return;
    setState("saving");
    try {
      await deps.current.save(job);
      setState(pending.current ? "saving" : "saved");
    } catch (err) {
      setState("error");
      deps.current.onError(errorMessage(err, "Não foi possível salvar."));
    }
  }, []);

  const queue = useCallback(
    (slug: string, id: string, patch: PagePatch) => {
      const previous = pending.current?.id === id ? pending.current.patch : {};
      pending.current = { slug, id, patch: { ...previous, ...patch } };
      setState("saving");
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void flush(), delay);
    },
    [flush, delay],
  );

  /** Descarta o que estava para ser gravado nesta página (ex.: ela foi excluída). */
  const discard = useCallback((id: string) => {
    if (pending.current?.id === id) pending.current = null;
  }, []);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (!pending.current) return;
      void flush();
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [flush]);

  return { state, queue, flush, discard };
}
