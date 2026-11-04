// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { FormatNewerNotice } from "../src/layout/FormatNewerNotice";
import { ApiError, errorMessage } from "../src/lib/api";

afterEach(cleanup);

it("o aviso diz a versão, que é só leitura e como atualizar", () => {
  render(<FormatNewerNotice version={2} />);
  const note = screen.getByRole("status");
  expect(note.textContent).toMatch(/formato 2/);
  expect(note.textContent).toMatch(/só para leitura/);
  expect(note.textContent).toMatch(/npx explicai@latest/);
});

it("o erro format-newer da API vira texto traduzível", () => {
  const err = new ApiError("pt", "format-newer", { version: 3, supported: 1 }, 409);
  expect(errorMessage(err)).toMatch(/formato 3/);
});
