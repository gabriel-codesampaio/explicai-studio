/** Reconexão com o servidor do Studio: tenta de novo com espera crescente até ele responder. */

/** 1 s, 2 s, 4 s, 8 s e depois 15 s: logo no começo (reinício do dev:server) e sem martelar depois. */
export const backoffDelay = (attempt: number): number => Math.min(1000 * 2 ** attempt, 15_000);

export interface WatchState {
  /** Quantas tentativas já falharam. */
  attempt: number;
  checking: boolean;
}

interface Options {
  /** Rejeita enquanto o servidor não responde. */
  check: () => Promise<unknown>;
  onBack: () => void;
  onChange?: (state: WatchState) => void;
}

export function watchServer({ check, onBack, onChange }: Options) {
  let attempt = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  let checking = false;

  const emit = () => onChange?.({ attempt, checking });
  const schedule = () => {
    timer = setTimeout(() => void run(), backoffDelay(attempt));
  };

  async function run() {
    if (stopped || checking) return;
    clearTimeout(timer);
    checking = true;
    emit();
    const ok = await check().then(
      () => true,
      () => false,
    );
    checking = false;
    if (stopped) return;
    if (ok) return onBack();
    attempt++;
    emit();
    schedule();
  }

  schedule();
  return {
    retryNow: () => void run(),
    stop: () => {
      stopped = true;
      clearTimeout(timer);
    },
  };
}
