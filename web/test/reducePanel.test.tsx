// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ReducePanel } from "../src/features/annotations/ReducePanel";
import { loadImage } from "../src/lib/redactImage";

vi.mock("../src/lib/redactImage", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../src/lib/redactImage")>()),
  loadImage: vi.fn(),
}));

const props = { slug: "m", asset: "assets/tela.png", src: "/assets/tela.png", pending: false, inGit: false, onApplied: () => {} };
const grande = { naturalWidth: 2400, naturalHeight: 1200 } as HTMLImageElement;

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it("mostra o motivo quando o servidor não entrega o arquivo, com Tentar de novo", async () => {
  vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }));
  render(<ReducePanel {...props} />);
  const alerta = await screen.findByRole("alert");
  expect(alerta.textContent).toContain("O servidor não entregou o arquivo");
  expect(screen.getByRole("button", { name: "Tentar de novo" })).toBeTruthy();
  expect(loadImage).not.toHaveBeenCalled();
});

it("mostra o motivo quando o navegador não abre a imagem", async () => {
  vi.mocked(fetch).mockResolvedValue(new Response(new Blob(["abc"])));
  vi.mocked(loadImage).mockRejectedValue(new Error("image"));
  render(<ReducePanel {...props} />);
  const alerta = await screen.findByRole("alert");
  expect(alerta.textContent).toContain("O navegador não conseguiu abrir o arquivo");
});

it("Tentar de novo carrega a imagem outra vez e mostra o painel", async () => {
  vi.mocked(fetch)
    .mockResolvedValueOnce(new Response(null, { status: 500 }))
    .mockResolvedValueOnce(new Response(new Blob(["abc"])));
  vi.mocked(loadImage).mockResolvedValue(grande);
  render(<ReducePanel {...props} />);
  fireEvent.click(await screen.findByRole("button", { name: "Tentar de novo" }));
  expect(await screen.findByText(/2400 × 1200 px/)).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
  expect(fetch).toHaveBeenCalledTimes(2);
});

it("Tentar de novo que falha de novo continua mostrando o erro", async () => {
  vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));
  render(<ReducePanel {...props} />);
  fireEvent.click(await screen.findByRole("button", { name: "Tentar de novo" }));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("O servidor não entregou o arquivo"));
});
