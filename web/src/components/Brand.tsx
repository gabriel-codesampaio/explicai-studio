/** Logo do Studio. O acento do "í" é desenhado no CSS (.wordmark .i), como no brand book. */
export function Brand() {
  return (
    <div className="brand" role="img" aria-label="Explicaí Studio">
      <img src="/favicon.svg" alt="" width="28" height="28" />
      <span className="wordmark" aria-hidden="true">
        explica<span className="i">ı</span>
      </span>
      <span className="sub" aria-hidden="true">
        studio
      </span>
    </div>
  );
}
