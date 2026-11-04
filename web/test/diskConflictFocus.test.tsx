// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { DiskConflictBanner } from "../src/features/errors/DiskConflictBanner";

afterEach(cleanup);

function setup() {
  const editor = document.createElement("div");
  editor.tabIndex = 0;
  document.body.append(editor);
  editor.focus();
  render(<DiskConflictBanner onReload={() => {}} onKeep={() => {}} />);
  return editor;
}

it("a faixa é um alerta e leva o foco à primeira ação", () => {
  setup();
  expect(screen.getByRole("alert")).toBeTruthy();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: /Manter a minha versão/ }));
});

it("Esc devolve o foco a quem o tinha (o editor)", () => {
  const editor = setup();
  fireEvent.keyDown(screen.getByRole("alert"), { key: "Escape" });
  expect(document.activeElement).toBe(editor);
});
