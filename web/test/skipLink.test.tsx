// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ErrorPage } from "../src/components/ErrorPage";

afterEach(cleanup);

const page = (standalone: boolean) =>
  render(
    <ErrorPage title="Algo *falhou*" action={{ label: "Tentar", onClick() {} }} technical="500" standalone={standalone}>
      Texto
    </ErrorPage>,
  );

describe("ErrorPage: regiões e link de pular", () => {
  it("página inteira tem main e o link de pular antes dele", () => {
    page(true);
    const main = screen.getByRole("main");
    const skip = screen.getByRole("link", { name: "Pular para o conteúdo" });
    expect(main.id).toBe("conteudo");
    expect(skip.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("dentro do Studio não cria outro main nem outro link", () => {
    page(false);
    expect(screen.queryByRole("main")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
