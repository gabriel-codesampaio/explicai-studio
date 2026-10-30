import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { backoffDelay, watchServer } from "../src/lib/reconnect";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it("a espera dobra a cada tentativa e para em 15 s", () => {
  expect([0, 1, 2, 3, 4, 5, 9].map(backoffDelay)).toEqual([1000, 2000, 4000, 8000, 15000, 15000, 15000]);
});

it("tenta de novo com espera crescente e avisa quando o servidor volta", async () => {
  const check = vi
    .fn()
    .mockRejectedValueOnce(new Error("fora"))
    .mockRejectedValueOnce(new Error("fora"))
    .mockResolvedValue(undefined);
  const onBack = vi.fn();
  watchServer({ check, onBack });

  await vi.advanceTimersByTimeAsync(999);
  expect(check).not.toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(1);
  expect(check).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1999);
  expect(check).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1);
  expect(check).toHaveBeenCalledTimes(2);
  expect(onBack).not.toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(4000);
  expect(check).toHaveBeenCalledTimes(3);
  expect(onBack).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(60_000);
  expect(check).toHaveBeenCalledTimes(3);
});

it("retryNow tenta já, sem esperar o relógio", async () => {
  const check = vi.fn().mockResolvedValue(undefined);
  const onBack = vi.fn();
  const watch = watchServer({ check, onBack });
  watch.retryNow();
  await vi.advanceTimersByTimeAsync(0);
  expect(onBack).toHaveBeenCalledTimes(1);
});

it("stop cancela a próxima tentativa", async () => {
  const check = vi.fn().mockResolvedValue(undefined);
  const watch = watchServer({ check, onBack: vi.fn() });
  watch.stop();
  await vi.advanceTimersByTimeAsync(60_000);
  expect(check).not.toHaveBeenCalled();
});

it("informa a tentativa em andamento para a tela mostrar", async () => {
  const states: { attempt: number; checking: boolean }[] = [];
  watchServer({ check: () => Promise.reject(new Error("fora")), onBack: vi.fn(), onChange: (s) => states.push(s) });
  await vi.advanceTimersByTimeAsync(1000);
  expect(states).toEqual([
    { attempt: 0, checking: true },
    { attempt: 1, checking: false },
  ]);
});
