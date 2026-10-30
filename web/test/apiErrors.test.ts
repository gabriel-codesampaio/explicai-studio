import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, api, errorMessage, isOffline } from "../src/lib/api";

it("erro com código vira o texto da interface, com os parâmetros no formato do idioma", () => {
  const err = new ApiError("texto do servidor", "low-contrast", { label: "destaque", ratio: 1.4, min: 4.5 });
  expect(errorMessage(err)).toBe(
    "A cor de destaque tem contraste 1,4:1 com o branco; o mínimo é 4,5:1. Escolha uma cor mais escura.",
  );
});

it("código desconhecido usa a mensagem do servidor", () => {
  expect(errorMessage(new ApiError("texto do servidor", "outro"))).toBe("texto do servidor");
});

it("os nomes dos campos de cor mandados pelo núcleo têm tradução", async () => {
  const { EN } = await import("../src/lib/i18n.en");
  for (const label of [
    "destaque",
    "texto",
    "título da capa",
    "título da página",
    "título de nível 1",
    "título de nível 2",
    "título de nível 3",
  ]) {
    expect(EN[label]).toBeTruthy();
  }
});

describe("erros de conexão e de acesso", () => {
  afterEach(() => vi.unstubAllGlobals());
  const stub = (impl: () => Promise<Response>) => vi.stubGlobal("fetch", vi.fn(impl));

  it("fetch que falha vira erro de servidor fora", async () => {
    stub(() => Promise.reject(new TypeError("Failed to fetch")));
    const err = await api.listManuals().catch((e: unknown) => e);
    expect(isOffline(err)).toBe(true);
    expect(errorMessage(err)).toMatch(/Não foi possível falar com o Studio/);
  });

  it.each([502, 503, 504])("%i do proxy sem JSON vira servidor fora", async (status) => {
    stub(() => Promise.resolve(new Response("", { status })));
    expect(isOffline(await api.listManuals().catch((e: unknown) => e))).toBe(true);
  });

  it("404 e 500 comuns não são servidor fora", async () => {
    stub(() => Promise.resolve(new Response(JSON.stringify({ error: "Manual não encontrado." }), { status: 404 })));
    const err = await api.getManual("x").catch((e: unknown) => e);
    expect(isOffline(err)).toBe(false);
    expect((err as ApiError).status).toBe(404);
  });

  it.each([
    ["forbidden-host", /só aceita pedidos deste computador/],
    ["forbidden-origin", /só aceita pedidos deste computador/],
    ["invalid-utf8", /UTF-8/],
    ["no-browser", /Chrome, o Edge ou o Chromium/],
  ])("código %s tem texto da interface", (code, text) => {
    expect(errorMessage(new ApiError("do servidor", code))).toMatch(text);
  });
});
