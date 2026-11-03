// @vitest-environment happy-dom
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStudio } from "../src/hooks/useStudio";
import { api, type Page } from "../src/lib/api";

vi.mock("sonner", () => ({ toast: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }) }));

const pageOf = (id: string): Page => ({ id, title: id, status: "rascunho", body: "", file: `pages/${id}.md` }) as Page;
const node = (id: string) => ({ id, title: id, status: "rascunho", children: [] });

/** Promessa que o teste resolve na hora que quiser. */
function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

let update: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  window.location.hash = "";
  vi.spyOn(api, "listManuals").mockResolvedValue([{ slug: "m", title: "M" }] as never);
  vi.spyOn(api, "getManual").mockResolvedValue({ slug: "m", title: "M", pages: [node("p0"), node("a"), node("b")] } as never);
  vi.spyOn(api, "getPage").mockImplementation(async (_s, id) => pageOf(id));
  update = vi.spyOn(api, "updatePage").mockImplementation(async (_s, id, patch) => ({ ...pageOf(id), ...patch }) as Page);
});

afterEach(() => vi.useRealTimers());

async function openFirstPage() {
  const hook = renderHook(() => useStudio());
  await waitFor(() => expect(hook.result.current.page?.id).toBe("p0"));
  return hook;
}

describe("useStudio", () => {
  it("descarta a resposta antiga ao trocar de página rápido", async () => {
    const slowA = deferred<Page>();
    vi.spyOn(api, "getPage").mockImplementation((_s, id) => (id === "a" ? slowA.promise : Promise.resolve(pageOf(id))));
    const { result } = await openFirstPage();

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

describe("useStudio: título da página", () => {
  it("grava o título sem renomear o arquivo enquanto a pessoa digita, e renomeia ao sair da página", async () => {
    const { result } = await openFirstPage();
    vi.useFakeTimers();
    act(() => result.current.editPage({ title: "Novo título" }));
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(update).toHaveBeenCalledWith("m", "p0", { title: "Novo título", fileName: "keep" });
    expect(update).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.selectPage("b");
    });
    expect(update).toHaveBeenLastCalledWith("m", "p0", { title: "Novo título", fileName: "sync" });
  });

  it("renomeia o arquivo 5 s depois da última gravação do título", async () => {
    const { result } = await openFirstPage();
    vi.useFakeTimers();
    act(() => result.current.editPage({ title: "Novo título" }));
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(update).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(update).toHaveBeenLastCalledWith("m", "p0", { title: "Novo título", fileName: "sync" });
  });
});
