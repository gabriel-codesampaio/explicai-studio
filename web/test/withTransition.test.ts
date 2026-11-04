// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { withTransition } from "../src/lib/withTransition";

type VT = { startViewTransition?: unknown };

const setMotion = (reduce: boolean) => {
  window.matchMedia = ((q: string) => ({
    matches: reduce && q === "(prefers-reduced-motion: reduce)",
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as never;
};

afterEach(() => {
  delete (document as unknown as VT).startViewTransition;
});

describe("withTransition", () => {
  it("roda direto quando o navegador não tem a API", async () => {
    setMotion(false);
    const update = vi.fn(async () => "ok");
    await expect(withTransition(update)).resolves.toBe("ok");
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("roda o update dentro da transição e devolve o valor dele", async () => {
    setMotion(false);
    const order: string[] = [];
    (document as unknown as VT).startViewTransition = vi.fn((cb: () => Promise<void>) => {
      order.push("inicio");
      const done = cb().then(() => order.push("callback"));
      return { updateCallbackDone: done };
    });
    const update = vi.fn(async () => {
      order.push("update");
      return 42;
    });
    await expect(withTransition(update)).resolves.toBe(42);
    expect(order).toEqual(["inicio", "update", "callback"]);
  });

  it("não inicia transição com prefers-reduced-motion: reduce", async () => {
    setMotion(true);
    const start = vi.fn();
    (document as unknown as VT).startViewTransition = start;
    const update = vi.fn(async () => "ok");
    await expect(withTransition(update)).resolves.toBe("ok");
    expect(start).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("propaga o erro do update quando há transição", async () => {
    setMotion(false);
    (document as unknown as VT).startViewTransition = (cb: () => Promise<void>) => ({
      updateCallbackDone: cb(),
    });
    await expect(withTransition(async () => Promise.reject(new Error("falhou")))).rejects.toThrow("falhou");
  });
});
