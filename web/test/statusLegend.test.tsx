// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { StatusDot, StatusLegend } from "../src/features/pages/StatusMenu";

afterEach(cleanup);

it("legenda nomeia as três etapas com bolinha e tem title", () => {
  const { container } = render(<StatusLegend />);
  for (const nome of ["Em revisão", "Aprovado", "Publicado"]) expect(screen.getByText(nome)).toBeTruthy();
  expect(container.querySelector("p")?.getAttribute("title")).toMatch(/rascunho/);
});

it("publicado tem forma própria (anel com miolo), diferente de cheia e de anel vazio", () => {
  const shape = (s: "aprovado" | "publicado" | "rascunho") =>
    render(<StatusDot status={s} />).container.querySelector("span")?.className;
  const [cheia, alvo, anel] = [shape("aprovado"), shape("publicado"), shape("rascunho")];
  expect(new Set([cheia, alvo, anel]).size).toBe(3);
  expect(alvo).toContain("radial-gradient");
});
