import { useEffect, useRef, useState } from "react";
import { type WatchState, watchServer } from "../lib/reconnect";

/**
 * Enquanto `active`, confere o servidor com espera crescente e chama `onBack` quando ele responde.
 * `retryNow` faz a pessoa tentar na hora ("Tentar agora").
 */
export function useReconnect(active: boolean, check: () => Promise<unknown>, onBack: () => void) {
  const [state, setState] = useState<WatchState>({ attempt: 0, checking: false });
  const watch = useRef<ReturnType<typeof watchServer> | null>(null);
  const latest = useRef({ check, onBack });
  latest.current = { check, onBack };

  useEffect(() => {
    if (!active) return;
    setState({ attempt: 0, checking: false });
    const w = watchServer({
      check: () => latest.current.check(),
      onBack: () => latest.current.onBack(),
      onChange: setState,
    });
    watch.current = w;
    return () => {
      w.stop();
      watch.current = null;
    };
  }, [active]);

  return { ...state, retryNow: () => watch.current?.retryNow() };
}
