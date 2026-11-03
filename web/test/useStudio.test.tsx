// @vitest-environment happy-dom
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStudio } from "../src/hooks/useStudio";
import { api, type Page } from "../src/lib/api";

vi.mock("sonner", () => ({ toast: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }) }));

const pageOf = (id: string): Page => ({ id, title: id, status: "rascunho", body: "", file: `${id}.md` }) as Page;
const node = (id: string) => ({ id, title: id, status: "rascunho", children: [] });

/** Promessa que o teste resolve na hora que quiser. */
function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

beforeEach(() => {
  window.location.hash = "";
  vi.spyOn(api, "listManuals").mockResolvedValue([{ slug: "m", title: "M" }] as never);
  vi.spyOn(api, "getManual").mockResolvedValue({ slug: "m", title: "M", pages: [node("p0"), node("a"), node("b")] } as never);
});

describe("useStudio", () => {
  it("descarta a resposta antiga ao trocar de página rápido", async () => {
    const slowA = deferred<Page>();
    vi.spyOn(api, "getPage").mockImplementation((_s, id) => (id === "a" ? slowA.promise : Promise.resolve(pageOf(id))));
    const { result } = renderHook(() => useStudio());
    await waitFor(() => expect(result.current.page?.id).toBe("p0"));

    let first!: Promise<void>;
    act(() => {
      first = result.current.selectPage("a");
    });
    await act(async () => {
      await result.current.selectPage("b");
    });
    await act(async () => {
      slowA.resolve(pageOf("a"));
      await first;
    });

    expect(result.current.page?.id).toBe("b");
    expect(window.location.hash).toContain("/b");
  });
});
