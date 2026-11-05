// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { AnnotationCanvas } from "../src/features/annotations/AnnotationCanvas";
import { emptyAnnotations } from "../src/lib/annotations";

afterEach(cleanup);

const canvas = () => (
  <AnnotationCanvas
    src="/files/m/assets/tela.png"
    alt="Tela"
    draft={{ ann: emptyAnnotations(), redact: [], crop: [] }}
    tool="marker"
    selectedId={null}
    defaultTarget={{ kind: "url", url: "" } as never}
    redactStyle={"solid" as never}
    onChange={() => {}}
    onSelect={() => {}}
  />
);

it("imagem que não carrega mostra o motivo e Tentar de novo remonta o <img> (T-421)", () => {
  render(canvas());
  const first = screen.getByAltText("Tela");
  fireEvent.error(first);
  expect(screen.getByRole("alert").textContent).toContain("Não foi possível carregar a imagem");
  expect(screen.queryByAltText("Tela")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
  expect(screen.queryByRole("alert")).toBeNull();
  const again = screen.getByAltText("Tela");
  expect(again).not.toBe(first);
  expect(again.getAttribute("src")).toBe("/files/m/assets/tela.png");
});
