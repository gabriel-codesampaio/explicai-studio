// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AnnotationEditor } from "../src/features/annotations/AnnotationEditor";
import { emptyAnnotations } from "../src/lib/annotations";
import { api } from "../src/lib/api";

vi.mock("../src/lib/annotationStore", () => ({
  useAnnotations: () => emptyAnnotations(),
  saveAnnotations: vi.fn(),
}));

// Asset que não é PNG/JPEG/WebP: os painéis de reduzir e ocultar não entram, então só a consulta do git importa.
const props = {
  slug: "m",
  asset: "assets/desenho.svg",
  src: "/assets/desenho.svg",
  alt: "Desenho",
  pages: [],
  onClose: () => {},
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("mostra o motivo quando não dá para ver se a pasta está no git, com Tentar de novo", async () => {
  vi.spyOn(api, "inGitRepo").mockRejectedValue(new Error("rede"));
  render(<AnnotationEditor {...props} />);
  const alerta = await screen.findByRole("alert");
  expect(alerta.textContent).toContain("Não foi possível verificar se a pasta está no git");
  expect(screen.getByRole("button", { name: "Tentar de novo" })).toBeTruthy();
});

it("Tentar de novo refaz a consulta e some o aviso quando ela dá certo", async () => {
  const consulta = vi.spyOn(api, "inGitRepo").mockRejectedValueOnce(new Error("rede")).mockResolvedValueOnce({ git: false });
  render(<AnnotationEditor {...props} />);
  fireEvent.click(await screen.findByRole("button", { name: "Tentar de novo" }));
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  expect(consulta).toHaveBeenCalledTimes(2);
});
