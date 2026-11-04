// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ShortcutsDialog } from "../src/features/help/ShortcutsDialog";

afterEach(cleanup);

it("lista Refazer com Ctrl+Shift+Z e Ctrl+Y", () => {
  render(<ShortcutsDialog open onOpenChange={() => {}} />);
  expect(screen.getAllByText("Refazer")).toHaveLength(2);
  expect(screen.getByText("Ctrl+Shift+Z")).toBeTruthy();
  expect(screen.getByText("Ctrl+Y")).toBeTruthy();
});
