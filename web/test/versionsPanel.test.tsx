// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { VersionsPanel } from "../src/features/versions/VersionsPanel";
import { api } from "../src/lib/api";

afterEach(cleanup);

it("os botões dizem que a versão vale para a página", async () => {
  vi.spyOn(api, "listVersions").mockResolvedValue([
    { id: "v1", title: "P", note: "Revisada", savedAt: "2026-11-04T10:00:00Z", published: false },
  ]);
  const noop = async () => {};
  render(<VersionsPanel slug="m" pageId="p" onSave={noop} onRestore={noop} onPublish={noop} pinned={false} />);
  fireEvent.click(screen.getByRole("button", { name: "Versões da página" }));

  expect(await screen.findByRole("button", { name: "Guardar versão da página" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Restaurar na página" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Usar na página do manual" })).toBeTruthy();
  expect(screen.getByText(/só desta página, não do manual inteiro/)).toBeTruthy();
});
