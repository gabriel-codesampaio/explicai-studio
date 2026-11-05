// @vitest-environment happy-dom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { CheckManualDialog } from "../src/features/check/CheckManualDialog";
import { findingDetail, kindLabel } from "../src/features/check/findingText";
import { api, type CheckFinding, type CheckKind } from "../src/lib/api";
import { EN } from "../src/lib/i18n.en";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const KINDS: CheckKind[] = [
  "no-image",
  "step-without-result",
  "dead-link",
  "missing-image",
  "hotspot-missing-page",
  "image-without-markers",
  "marker-without-label",
  "to-confirm",
];

it("os 8 tipos têm nome próprio e tradução em inglês", () => {
  const labels = KINDS.map(kindLabel);
  expect(new Set(labels).size).toBe(8);
  expect(labels.filter((l) => !(l in EN))).toEqual([]);
  expect(kindLabel("to-confirm")).toBe("A confirmar");
});

it("detalhe do núcleo vira texto da interface só com a parte variável", () => {
  expect(findingDetail("step-without-result", 'Passo sem "Resultado:": Clique em A')).toBe("Passo: Clique em A");
  expect(findingDetail("marker-without-label", "Marcador sem descrição em assets/a.png: 2, 3")).toBe(
    "Arquivo assets/a.png, marcadores 2, 3",
  );
  expect(findingDetail("hotspot-missing-page", "Hotspot de assets/h.png aponta para página apagada (xyz).")).toBe(
    "Arquivo assets/h.png, página de destino xyz",
  );
  expect(findingDetail("dead-link", "formato novo")).toBe("formato novo");
});

const finding = (pageId: string, title: string, kind: CheckKind): CheckFinding => ({ pageId, title, kind, detail: "x" });

it("agrupa por página e clicar num achado abre a página", async () => {
  vi.spyOn(api, "checkManual").mockResolvedValue([
    finding("a", "Página A", "to-confirm"),
    finding("a", "Página A", "no-image"),
    finding("b", "Página B", "dead-link"),
  ]);
  const onOpenPage = vi.fn();
  render(<CheckManualDialog slug="m" onOpenPage={onOpenPage} onClose={() => {}} />);
  expect(await screen.findByRole("heading", { name: "Página A" })).toBeTruthy();
  expect(screen.getByRole("dialog", { name: "Checar manual" })).toBeTruthy();
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
  expect(screen.getByText("A confirmar")).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: /Link para página que não existe/ }));
  expect(onOpenPage).toHaveBeenCalledWith("b");
});

it("sem achado mostra o estado vazio", async () => {
  vi.spyOn(api, "checkManual").mockResolvedValue([]);
  render(<CheckManualDialog slug="m" onOpenPage={() => {}} onClose={() => {}} />);
  expect(await screen.findByText("Nenhum problema encontrado.")).toBeTruthy();
});

it("erro da rota aparece como alerta", async () => {
  vi.spyOn(api, "checkManual").mockRejectedValue(new Error("Deu ruim."));
  render(<CheckManualDialog slug="m" onOpenPage={() => {}} onClose={() => {}} />);
  await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Deu ruim."));
});
