// @vitest-environment happy-dom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutosave } from "../src/hooks/useAutosave";

type Job = Parameters<Parameters<typeof useAutosave>[0]>[0];

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("useAutosave", () => {
  it("espera o tempo de espera e grava uma vez só com as mudanças juntas", async () => {
    const save = vi.fn<(job: Job) => Promise<void>>().mockResolvedValue();
    const { result } = renderHook(() => useAutosave(save, 600));

    act(() => result.current.queue("m", "p1", { title: "A" }));
    act(() => result.current.queue("m", "p1", { body: "texto" }));
    expect(result.current.state).toBe("saving");

    await act(() => vi.advanceTimersByTimeAsync(599));
    expect(save).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1));

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ slug: "m", id: "p1", patch: { title: "A", body: "texto" } });
    expect(result.current.state).toBe("saved");
    expect(result.current.savedAt).toBeInstanceOf(Date);
  });

  it("cada nova mudança reinicia a espera", async () => {
    const save = vi.fn<(job: Job) => Promise<void>>().mockResolvedValue();
    const { result } = renderHook(() => useAutosave(save, 600));

    act(() => result.current.queue("m", "p1", { body: "a" }));
    await act(() => vi.advanceTimersByTimeAsync(500));
    act(() => result.current.queue("m", "p1", { body: "ab" }));
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(save).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(100));
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("flush grava na hora e não grava de novo depois", async () => {
    const save = vi.fn<(job: Job) => Promise<void>>().mockResolvedValue();
    const { result } = renderHook(() => useAutosave(save, 600));

    act(() => result.current.queue("m", "p1", { body: "a" }));
    await act(() => result.current.flush());
    expect(save).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("flush sem nada pendente não grava", async () => {
    const save = vi.fn<(job: Job) => Promise<void>>().mockResolvedValue();
    const { result } = renderHook(() => useAutosave(save));
    await act(() => result.current.flush());
    expect(save).not.toHaveBeenCalled();
    expect(result.current.state).toBe("idle");
  });

  it("discard descarta o que estava pendente da página", async () => {
    const save = vi.fn<(job: Job) => Promise<void>>().mockResolvedValue();
    const { result } = renderHook(() => useAutosave(save, 600));

    act(() => result.current.queue("m", "p1", { body: "a" }));
    act(() => result.current.discard("p1"));
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(save).not.toHaveBeenCalled();
  });

  it("falha mantém o texto na fila e retry grava de novo", async () => {
    const save = vi.fn<(job: Job) => Promise<void>>().mockRejectedValueOnce(new Error("fora")).mockResolvedValue();
    const { result } = renderHook(() => useAutosave(save, 600));

    act(() => result.current.queue("m", "p1", { body: "importante" }));
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(result.current.state).toBe("error");

    await act(() => result.current.retry());
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith({ slug: "m", id: "p1", patch: { body: "importante" } });
    expect(result.current.state).toBe("saved");
  });

  it("não perde o que foi digitado enquanto a gravação falha", async () => {
    let fail!: (e: Error) => void;
    const save = vi
      .fn<(job: Job) => Promise<void>>()
      .mockImplementationOnce(() => new Promise<void>((_, reject) => (fail = reject)))
      .mockResolvedValue();
    const { result } = renderHook(() => useAutosave(save, 600));

    act(() => result.current.queue("m", "p1", { title: "T" }));
    await act(() => vi.advanceTimersByTimeAsync(600));
    act(() => result.current.queue("m", "p1", { body: "novo" }));
    await act(async () => fail(new Error("fora")));
    await act(() => result.current.retry());

    expect(save).toHaveBeenLastCalledWith({ slug: "m", id: "p1", patch: { title: "T", body: "novo" } });
  });

  it("avisa ao fechar a aba com texto pendente e grava", async () => {
    const save = vi.fn<(job: Job) => Promise<void>>().mockResolvedValue();
    const { result } = renderHook(() => useAutosave(save, 600));

    const quiet = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(quiet);
    expect(quiet.defaultPrevented).toBe(false);

    act(() => result.current.queue("m", "p1", { body: "a" }));
    const pending = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(pending);
    expect(pending.defaultPrevented).toBe(true);
    expect(save).toHaveBeenCalledTimes(1);
  });
});
