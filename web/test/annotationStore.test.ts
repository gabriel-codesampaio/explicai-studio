// @vitest-environment happy-dom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Annotations } from "../src/lib/annotations";

const { getAnnotations, saveApi } = vi.hoisted(() => ({ getAnnotations: vi.fn(), saveApi: vi.fn() }));
vi.mock("../src/lib/api", () => ({ api: { getAnnotations, saveAnnotations: saveApi } }));

const mark = (n: number) => ({ shapes: [{ n }] }) as unknown as Annotations;
let store: typeof import("../src/lib/annotationStore");
let n = 0;
let asset: string;

beforeEach(async () => {
  vi.resetModules();
  getAnnotations.mockReset();
  saveApi.mockReset();
  store = await import("../src/lib/annotationStore");
  asset = `img-${++n}.png`;
});
afterEach(cleanup);

describe("annotationStore", () => {
  it("começa nulo, carrega da API e entrega as marcações", async () => {
    getAnnotations.mockResolvedValue(mark(1));
    const { result } = renderHook(() => store.useAnnotations("m", asset));
    expect(result.current).toBeNull();
    await waitFor(() => expect(result.current).toEqual(mark(1)));
    expect(getAnnotations).toHaveBeenCalledWith("m", asset);
  });

  it("busca uma vez só por imagem, mesmo com dois leitores", async () => {
    getAnnotations.mockResolvedValue(mark(1));
    const a = renderHook(() => store.useAnnotations("m", asset));
    const b = renderHook(() => store.useAnnotations("m", asset));
    await waitFor(() => expect(a.result.current).toEqual(mark(1)));
    expect(b.result.current).toEqual(mark(1));
    expect(getAnnotations).toHaveBeenCalledTimes(1);
  });

  it("não busca sem imagem", () => {
    const { result } = renderHook(() => store.useAnnotations("m", null));
    expect(result.current).toBeNull();
    expect(getAnnotations).not.toHaveBeenCalled();
  });

  it("falha ao carregar fica nulo e a próxima leitura tenta de novo", async () => {
    getAnnotations.mockRejectedValueOnce(new Error("fora")).mockResolvedValue(mark(2));
    const first = renderHook(() => store.useAnnotations("m", asset));
    await waitFor(() => expect(getAnnotations).toHaveBeenCalledTimes(1));
    expect(first.result.current).toBeNull();
    first.unmount();

    const second = renderHook(() => store.useAnnotations("m", asset));
    await waitFor(() => expect(second.result.current).toEqual(mark(2)));
  });

  it("saveAnnotations grava e atualiza quem está lendo", async () => {
    getAnnotations.mockResolvedValue(mark(1));
    saveApi.mockResolvedValue(mark(3));
    const { result } = renderHook(() => store.useAnnotations("m", asset));
    await waitFor(() => expect(result.current).toEqual(mark(1)));

    await act(() => store.saveAnnotations("m", asset, mark(3)));
    expect(saveApi).toHaveBeenCalledWith("m", asset, mark(3));
    expect(result.current).toEqual(mark(3));
  });

  it("falha ao gravar propaga o erro e mantém o que havia", async () => {
    getAnnotations.mockResolvedValue(mark(1));
    saveApi.mockRejectedValue(new Error("fora"));
    const { result } = renderHook(() => store.useAnnotations("m", asset));
    await waitFor(() => expect(result.current).toEqual(mark(1)));

    await expect(store.saveAnnotations("m", asset, mark(3))).rejects.toThrow("fora");
    expect(result.current).toEqual(mark(1));
  });
});
