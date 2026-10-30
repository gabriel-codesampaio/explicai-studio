import { useCallback, useEffect, useRef, useState } from "react";
import type { PagePatch } from "../lib/api";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface Job {
  slug: string;
  id: string;
  patch: PagePatch;
}

/**
 * Junta as mudanças de uma página e grava `delay` ms depois da última. `flush` grava na hora,
 * e é chamado antes de trocar de página para nada ficar para trás. Se a gravação falha,
 * a mudança continua pendente e `retry` tenta de novo.
 */
export function useAutosave(save: (job: Job) => Promise<void>, delay = 600) {
  const [state, setState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  // Uma mudança pendente por página: trocar de página com a gravação falhando não mistura nem perde texto.
  const pending = useRef(new Map<string, Job>());
  const timer = useRef<number | undefined>(undefined);
  const saveRef = useRef(save);
  saveRef.current = save;

  const flush = useCallback(async () => {
    window.clearTimeout(timer.current);
    const jobs = [...pending.current.values()];
    pending.current.clear();
    if (jobs.length === 0) return;
    setState("saving");
    let failed = false;
    for (const job of jobs) {
      try {
        await saveRef.current(job);
        setSavedAt(new Date());
      } catch {
        // Devolve a mudança para a fila, sem perder o que foi digitado enquanto isso.
        const newer = pending.current.get(job.id);
        pending.current.set(job.id, { ...job, patch: { ...job.patch, ...newer?.patch } });
        failed = true;
      }
    }
    setState(failed ? "error" : pending.current.size > 0 ? "saving" : "saved");
  }, []);

  const queue = useCallback(
    (slug: string, id: string, patch: PagePatch) => {
      pending.current.set(id, { slug, id, patch: { ...pending.current.get(id)?.patch, ...patch } });
      setState("saving");
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void flush(), delay);
    },
    [flush, delay],
  );

  /** Descarta o que estava para ser gravado nesta página (ex.: ela foi excluída). */
  const discard = useCallback((id: string) => {
    pending.current.delete(id);
  }, []);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (pending.current.size === 0) return;
      void flush();
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [flush]);

  return { state, savedAt, queue, flush, retry: flush, discard };
}
