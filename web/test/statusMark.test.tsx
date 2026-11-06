// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { StatusDot, StatusMark } from "../src/features/pages/StatusMenu";

afterEach(cleanup);

it("marca da árvore diz a etapa em title e em texto para leitor de tela, sem legenda", () => {
  for (const [status, nome] of [
    ["revisao", "Em revisão"],
    ["aprovado", "Aprovado"],
    ["publicado", "Publicado"],
  ] as const) {
    const { container } = render(<StatusMark status={status} />);
    expect(container.querySelector("span")?.getAttribute("title")).toBe(nome);
    expect(screen.getByText(nome).className).toContain("sr-only");
    cleanup();
  }
});

it("publicado tem forma própria (anel com miolo), diferente de cheia e de anel vazio", () => {
  const shape = (s: "aprovado" | "publicado" | "rascunho") =>
    render(<StatusDot status={s} />).container.querySelector("span")?.className;
  const [cheia, alvo, anel] = [shape("aprovado"), shape("publicado"), shape("rascunho")];
  expect(new Set([cheia, alvo, anel]).size).toBe(3);
  expect(alvo).toContain("radial-gradient");
});
