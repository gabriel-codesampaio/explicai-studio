import { useCallback, useEffect, useState } from "react";
import { api, type CheckFinding } from "@/lib/api";

export interface ManualCheck {
  /** `null` enquanto confere ou se a conferência falhou. */
  findings: CheckFinding[] | null;
  error: unknown;
  reload: () => void;
}

/** Confere o manual `slug` no servidor (só leitura). Refaz ao trocar de manual e quando `reload` é chamado. */
export function useManualCheck(slug: string | undefined): ManualCheck {
  const [state, setState] = useState<{ slug?: string; findings: CheckFinding[] | null; error: unknown }>({
    findings: null,
    error: null,
  });
  const [tick, setTick] = useState(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `tick` é o gatilho do reload
  useEffect(() => {
    if (!slug) return;
    let alive = true;
    api.checkManual(slug).then(
      (findings) => alive && setState({ slug, findings, error: null }),
      (error) => alive && setState({ slug, findings: null, error }),
    );
    return () => {
      alive = false;
    };
  }, [slug, tick]);
  const reload = useCallback(() => setTick((n) => n + 1), []);
  // Resultado de outro manual não vale: some até chegar o do atual.
  return { findings: state.slug === slug ? state.findings : null, error: state.slug === slug ? state.error : null, reload };
}
