/** Logo do Studio. O acento do "í" é desenhado no CSS (.wordmark .i), como no brand book. */
export function Brand() {
  return (
    <div className="flex items-center gap-2 px-1" role="img" aria-label="Explicaí Studio">
      <img src="/favicon.svg" alt="" width="26" height="26" />
      <span className="wordmark text-[21px]" aria-hidden="true">
        explica<span className="i">ı</span>
      </span>
      <span className="font-mono text-xs text-muted-foreground" aria-hidden="true">
        studio
      </span>
    </div>
  );
}
