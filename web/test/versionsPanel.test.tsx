// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { VersionsPanel } from "../src/features/versions/VersionsPanel";
import { api } from "../src/lib/api";

afterEach(cleanup);

it("os botões dizem o que a versão faz na página", async () => {
  vi.spyOn(api, "listVersions").mockResolvedValue([
    { id: "v1", title: "P", note: "Revisada", savedAt: "2026-11-04T10:00:00Z", published: false },
  ]);
  const noop = async () => {};
  render(<VersionsPanel slug="m" pageId="p" onSave={noop} onRestore={noop} onPublish={noop} pageTitle="P" />);
  fireEvent.click(screen.getByRole("button", { name: "Versões" }));

  expect(await screen.findByRole("button", { name: "Guardar versão da página" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Restaurar" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Fixar no manual" })).toBeTruthy();
  expect(screen.getByText(/só desta página, não do manual inteiro/)).toBeTruthy();
});

it("a linha só mostra o título da versão quando ele difere do atual (T-562)", async () => {
  vi.spyOn(api, "listVersions").mockResolvedValue([
    { id: "v1", title: "P", note: "Igual", savedAt: "2026-11-04T10:00:00Z", published: false },
    { id: "v2", title: "Antigo", note: "Mudou", savedAt: "2026-11-04T09:00:00Z", published: false },
  ]);
  const noop = async () => {};
  render(<VersionsPanel slug="m" pageId="p" onSave={noop} onRestore={noop} onPublish={noop} pageTitle="P" />);
  fireEvent.click(screen.getByRole("button", { name: "Versões" }));
  await screen.findAllByRole("button", { name: "Restaurar" });
  expect(screen.getByText(/· Antigo/)).toBeTruthy();
  expect(screen.queryByText(/· P$/)).toBeNull();
});

it("o botão Versões não leva o selo da versão fixada (T-564)", () => {
  const noop = async () => {};
  render(<VersionsPanel slug="m" pageId="p" onSave={noop} onRestore={noop} onPublish={noop} pageTitle="P" />);
  expect(screen.getByRole("button", { name: "Versões" }).textContent).toBe("Versões");
});

it("comparar grava o que está pendente no editor antes de ler o texto atual (T-569)", async () => {
  const order: string[] = [];
  vi.spyOn(api, "listVersions").mockResolvedValue([
    { id: "v1", title: "P", note: "Revisada", savedAt: "2026-11-04T10:00:00Z", published: false },
  ]);
  vi.spyOn(api, "getVersion").mockImplementation(async () => {
    order.push("lê versão");
    return { id: "v1", title: "P", note: "Revisada", savedAt: "", published: false, body: "a" } as never;
  });
  vi.spyOn(api, "getPage").mockImplementation(async () => {
    order.push("lê página");
    return { body: "b" } as never;
  });
  const flush = vi.fn(async () => void order.push("flush"));
  const noop = async () => {};
  render(<VersionsPanel slug="m" pageId="p" onSave={noop} onRestore={noop} onPublish={noop} pageTitle="P" flush={flush} />);
  fireEvent.click(screen.getByRole("button", { name: "Versões" }));
  fireEvent.click(await screen.findByRole("button", { name: "Comparar com o atual" }));
  await screen.findByRole("button", { name: "Voltar à lista" });
  expect(order[0]).toBe("flush");
});
