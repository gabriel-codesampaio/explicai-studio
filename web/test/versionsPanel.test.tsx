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
  render(<VersionsPanel slug="m" pageId="p" onSave={noop} onRestore={noop} onPublish={noop} pinned={false} />);
  fireEvent.click(screen.getByRole("button", { name: "Versões" }));

  expect(await screen.findByRole("button", { name: "Guardar versão da página" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Restaurar" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Fixar no manual" })).toBeTruthy();
  expect(screen.getByText(/só desta página, não do manual inteiro/)).toBeTruthy();
});
