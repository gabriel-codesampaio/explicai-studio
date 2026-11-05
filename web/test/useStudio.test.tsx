// @vitest-environment happy-dom
import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStudio } from "../src/hooks/useStudio";
import { ApiError, api, type Page } from "../src/lib/api";

vi.mock("sonner", () => ({ toast: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn(), warning: vi.fn() }) }));

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

  it("servidor fora ao trocar de página: acusa a queda e mantém a página aberta", async () => {
    const { result } = await openFirstPage();
    vi.mocked(api.getPage).mockRejectedValueOnce(new ApiError("x", "offline"));
    await act(async () => {
      await result.current.selectPage("a");
    });
    expect(result.current.page?.id).toBe("p0");
    await waitFor(() => expect(result.current.serverDown).toBe(true));
  });

  it("servidor fora na gravação: acusa a queda e o texto continua na fila para o retry", async () => {
    const { result } = await openFirstPage();
    update.mockRejectedValueOnce(new ApiError("x", "offline"));
    vi.useFakeTimers();
    act(() => result.current.editPage({ body: "meu texto" }));
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(result.current.serverDown).toBe(true);
    expect(result.current.save.state).toBe("error");
    await act(async () => {
      await result.current.flush();
    });
    expect(update).toHaveBeenLastCalledWith("m", "p0", { body: "meu texto" }, undefined);
  });
});

describe("useStudio: título da página", () => {
  it("grava o título sem renomear o arquivo enquanto a pessoa digita, e renomeia ao sair da página", async () => {
    const { result } = await openFirstPage();
    vi.useFakeTimers();
    act(() => result.current.editPage({ title: "Novo título" }));
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(update).toHaveBeenCalledWith("m", "p0", { title: "Novo título", fileName: "keep" }, undefined);
    expect(update).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.selectPage("b");
    });
    expect(update).toHaveBeenLastCalledWith("m", "p0", { title: "Novo título", fileName: "sync" }, undefined);
  });

  it("renomeia o arquivo 5 s depois da última gravação do título", async () => {
    const { result } = await openFirstPage();
    vi.useFakeTimers();
    act(() => result.current.editPage({ title: "Novo título" }));
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(update).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(update).toHaveBeenLastCalledWith("m", "p0", { title: "Novo título", fileName: "sync" }, undefined);
  });
});

describe("useStudio: renomear com autosave em voo (T-120)", () => {
  it("o sync de 5 s espera o autosave em voo e leva a versão nova", async () => {
    let n = 0;
    vi.mocked(api.updatePage).mockImplementation(
      async (_s, id, patch) => ({ ...pageOf(id), ...patch, version: `v${++n}` }) as Page,
    );
    const { result } = await openFirstPage();
    vi.useFakeTimers();
    act(() => result.current.editPage({ title: "Novo título" }));
    await act(() => vi.advanceTimersByTimeAsync(600)); // título gravado (v1); sync marcado para 5,6 s
    await act(() => vi.advanceTimersByTimeAsync(4300)); // 4,9 s
    const slow = deferred<Page>();
    update.mockImplementationOnce(() => slow.promise);
    act(() => result.current.editPage({ body: "texto" }));
    await act(() => vi.advanceTimersByTimeAsync(700)); // autosave em voo; o timer do sync dispara
    expect(update).toHaveBeenCalledTimes(2);
    slow.resolve({ ...pageOf("p0"), version: "v2" } as Page);
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(update).toHaveBeenCalledTimes(3);
    expect(update).toHaveBeenLastCalledWith("m", "p0", { title: "Novo título", fileName: "sync" }, "v2");
    expect(result.current.diskConflict).toBe(false);
  });
});

describe("useStudio: conflito com o disco", () => {
  const conflito = () => new ApiError("x", "disk-conflict", {}, 409);
  beforeEach(() => {
    vi.spyOn(api, "getPage").mockImplementation(async (_s, id) => ({ ...pageOf(id), version: "v1" }));
  });

  async function editWithConflict() {
    const hook = await openFirstPage();
    vi.useFakeTimers();
    update.mockRejectedValueOnce(conflito());
    act(() => hook.result.current.editPage({ body: "meu texto" }));
    await act(() => vi.advanceTimersByTimeAsync(600));
    return hook;
  }

  it("envia a versão lida e, no 409, para de gravar e abre a faixa com as duas ações", async () => {
    const { result } = await editWithConflict();
    expect(update).toHaveBeenCalledWith("m", "p0", { body: "meu texto" }, "v1");
    expect(result.current.diskConflict).toBe(true);
    expect(result.current.save.state).toBe("conflict");

    // Nova digitação não volta ao servidor enquanto o aviso está aberto.
    act(() => result.current.editPage({ body: "meu texto 2" }));
    await act(() => vi.advanceTimersByTimeAsync(600));
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("Recarregar do disco descarta o rascunho local e não grava nada", async () => {
    const { result } = await editWithConflict();
    const before = result.current.revision;
    vi.useRealTimers();
    await act(async () => result.current.resolveConflict("reload"));
    await waitFor(() => expect(result.current.revision).toBe(before + 1));
    expect(update).toHaveBeenCalledTimes(1);
    expect(result.current.save.state).toBe("idle");
    expect(result.current.diskConflict).toBe(false);
  });

  it("Recarregar do disco com a leitura falhando mantém o rascunho e a faixa", async () => {
    const { result } = await editWithConflict();
    vi.mocked(api.getPage).mockRejectedValueOnce(new ApiError("x", "boom", {}, 500));
    vi.useRealTimers();
    await act(async () => result.current.resolveConflict("reload"));
    expect(result.current.diskConflict).toBe(true);
    expect(result.current.save.state).toBe("conflict");
  });

  it("Manter a minha versão regrava o rascunho com a versão atual do disco", async () => {
    const { result } = await editWithConflict();
    vi.mocked(api.getPage).mockResolvedValue({ ...pageOf("p0"), version: "v2" });
    vi.useRealTimers();
    await act(async () => result.current.resolveConflict("keep"));
    await waitFor(() => expect(update).toHaveBeenCalledTimes(2));
    expect(update).toHaveBeenLastCalledWith("m", "p0", { body: "meu texto" }, "v2");
    await waitFor(() => expect(result.current.save.state).toBe("saved"));
    expect(result.current.diskConflict).toBe(false);
  });

  it("ao voltar ao foco, rebusca manuais, árvore e a página que mudou no disco", async () => {
    vi.spyOn(api, "getPage").mockImplementation(async (_s, id) => ({ ...pageOf(id), version: "v1" }) as Page);
    const { result } = await openFirstPage();
    expect(result.current.manual?.pages).toHaveLength(3);

    vi.spyOn(api, "listManuals").mockResolvedValue([
      { slug: "m", title: "M" },
      { slug: "novo", title: "N" },
    ] as never);
    vi.spyOn(api, "getManual").mockResolvedValue({
      slug: "m",
      title: "M",
      pages: [node("p0"), node("a"), node("b"), node("c")],
    } as never);
    vi.spyOn(api, "getPage").mockImplementation(async (_s, id) => ({ ...pageOf(id), body: "de fora", version: "v2" }) as Page);
    const rev = result.current.revision;
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
    });

    await waitFor(() => expect(result.current.manuals).toHaveLength(2));
    expect(result.current.manual?.pages).toHaveLength(4);
    expect(result.current.page?.body).toBe("de fora");
    expect(result.current.revision).toBe(rev + 1);
  });
  describe("erros do sync ao voltar ao foco", () => {
    const focus = () =>
      act(async () => {
        window.dispatchEvent(new Event("focus"));
      });

    it("página apagada por fora: avisa, volta à árvore e oferece copiar o texto não gravado", async () => {
      const { result } = await openFirstPage();
      update.mockRejectedValue(new ApiError("sumiu", "not-found", {}, 404));
      act(() => result.current.editPage({ body: "meu texto" }));
      vi.spyOn(api, "getManual").mockResolvedValue({ slug: "m", title: "M", pages: [node("a"), node("b")] } as never);
      await focus();

      await waitFor(() => expect(toast.warning).toHaveBeenCalled());
      const [, opts] = vi.mocked(toast.warning).mock.calls.at(-1) as unknown as [
        string,
        { action?: { label: string; onClick: () => void }; cancel?: { label: string; onClick: () => void } },
      ];
      expect(opts.cancel?.label).toMatch(/Copiar/);
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
      opts.cancel?.onClick();
      expect(writeText).toHaveBeenCalledWith("meu texto");
      expect(result.current.manual?.pages).toHaveLength(2);
      expect(result.current.page?.id).not.toBe("p0"); // não fica no editor da página apagada
    });

    it("página apagada por fora: Recriar página cria com o título e o texto não gravado e abre", async () => {
      const { result } = await openFirstPage();
      update.mockRejectedValue(new ApiError("sumiu", "not-found", {}, 404));
      act(() => result.current.editPage({ title: "Novo nome", body: "meu texto" }));
      vi.spyOn(api, "getManual").mockResolvedValue({ slug: "m", title: "M", pages: [node("a"), node("b")] } as never);
      await focus();
      await waitFor(() => expect(toast.warning).toHaveBeenCalled());
      const [, opts] = vi.mocked(toast.warning).mock.calls.at(-1) as unknown as [
        string,
        { action?: { label: string; onClick: () => void } },
      ];
      expect(opts.action?.label).toBe("Recriar página");

      // O disco agora tem a página recriada: uma sincronização tardia não a acha "apagada" de novo.
      vi.spyOn(api, "getManual").mockResolvedValue({
        slug: "m",
        title: "M",
        pages: [node("a"), node("b"), node("novo")],
      } as never);
      const add = vi.spyOn(api, "addPage").mockResolvedValue(pageOf("novo"));
      update
        .mockReset()
        .mockImplementation((async (_s: string, id: string, patch: object) => ({ ...pageOf(id), ...patch })) as never);
      await act(async () => opts.action?.onClick());

      expect(add).toHaveBeenCalledWith("m", "Novo nome", null);
      expect(update).toHaveBeenCalledWith("m", "novo", { body: "meu texto" });

      await waitFor(() => expect(result.current.page?.id).toBe("novo"));
    });

    it("outro erro vira toast com o motivo", async () => {
      await openFirstPage();
      vi.mocked(toast.error).mockClear();
      vi.spyOn(api, "listManuals").mockRejectedValue(new ApiError("disco cheio", "x", {}, 500));
      await focus();
      await waitFor(() => expect(toast.error).toHaveBeenCalledWith("disco cheio", expect.anything()));
    });

    it("offline segue silencioso: só marca o servidor como fora", async () => {
      const { result } = await openFirstPage();
      vi.mocked(toast.error).mockClear();
      vi.spyOn(api, "listManuals").mockRejectedValue(new ApiError("x", "offline"));
      await focus();
      await waitFor(() => expect(result.current.serverDown).toBe(true));
      expect(toast.error).not.toHaveBeenCalled();
    });
  });
});
