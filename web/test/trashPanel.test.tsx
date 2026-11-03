// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { TrashPanel } from "../src/features/pages/TrashPanel";
import { api } from "../src/lib/api";

afterEach(cleanup);

it("limpar imagens sem uso grava a fila do autosave antes de chamar o servidor", async () => {
  const calls: string[] = [];
  vi.spyOn(api, "listTrash").mockResolvedValue([]);
  vi.spyOn(api, "unusedAssets").mockResolvedValue({ count: 1 });
  vi.spyOn(api, "cleanUnusedAssets").mockImplementation(async () => {
    calls.push("limpar");
    return { moved: 1, folder: ".lixeira/imagens-x" };
  });
  const flush = vi.fn(async () => void calls.push("flush"));

  render(<TrashPanel slug="m" open onOpenChange={() => {}} onRestore={async () => {}} flush={flush} />);
  fireEvent.click(await screen.findByRole("button", { name: /Mover para a lixeira/ }));

  await waitFor(() => expect(calls).toEqual(["flush", "limpar"]));
});
