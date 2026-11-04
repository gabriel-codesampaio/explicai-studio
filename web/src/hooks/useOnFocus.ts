import { useEffect, useRef } from "react";

/** Chama `fn` quando a aba volta ao foco (no máximo uma vez por `minGapMs`). */
export function useOnFocus(fn: () => void, minGapMs = 2000) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    let last = 0;
    const go = () => {
      if (document.visibilityState === "hidden" || Date.now() - last < minGapMs) return;
      last = Date.now();
      ref.current();
    };
    window.addEventListener("focus", go);
    document.addEventListener("visibilitychange", go);
    return () => {
      window.removeEventListener("focus", go);
      document.removeEventListener("visibilitychange", go);
    };
  }, [minGapMs]);
}
