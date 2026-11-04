// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { CreateManual } from "../src/features/manuals/CreateManual";

afterEach(cleanup);

it("botão desabilitado tem o motivo ligado por aria-describedby; some ao preencher", () => {
  render(<CreateManual firstRun onCreate={async () => {}} onCancel={() => {}} />);
  const button = screen.getByRole("button", { name: "Criar manual" });
  expect((button as HTMLButtonElement).disabled).toBe(true);
  const reason = document.getElementById(button.getAttribute("aria-describedby") ?? "");
  expect(reason?.textContent).toBe("Dê um nome ao manual.");

  fireEvent.change(screen.getByLabelText("Nome do manual"), { target: { value: "Financeiro" } });
  expect((button as HTMLButtonElement).disabled).toBe(false);
  expect(button.getAttribute("aria-describedby")).toBeNull();
  expect(screen.queryByText("Dê um nome ao manual.")).toBeNull();
});
