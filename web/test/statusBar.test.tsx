// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { StatusBar } from "../src/layout/StatusBar";

afterEach(cleanup);

const bar = (state: Parameters<typeof StatusBar>[0]["state"]) =>
  render(<StatusBar path="m/p.md" state={state} savedAt={null} onRetry={() => {}} />);

it("falha de salvamento com o servidor no ar oferece Tentar de novo", () => {
  bar("error");
  expect(screen.getByRole("button", { name: "Tentar de novo" })).toBeTruthy();
});

it("servidor fora: só espera, sem Tentar de novo (a faixa de conexão tem a ação)", () => {
  bar("offline");
  expect(screen.queryByRole("button")).toBeNull();
  expect(screen.getByRole("status").textContent).toContain("Aguardando o servidor");
});
