// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ReviewedControl } from "../src/features/pages/ReviewedControl";

afterEach(cleanup);

it("a data conferida fica numa região aria-live que o leitor de tela anuncia", () => {
  const { rerender: again } = render(<ReviewedControl reviewed={undefined} onMark={vi.fn()} />);
  const before = screen.getByTestId("reviewed-label").textContent;
  again(<ReviewedControl reviewed="2026-11-05" onMark={vi.fn()} />);
  expect(screen.getByTestId("reviewed-label").textContent).not.toBe(before);
});

it("a região é aria-live polite", () => {
  render(<ReviewedControl reviewed={undefined} onMark={vi.fn()} />);
  expect(screen.getByTestId("reviewed-label").getAttribute("aria-live")).toBe("polite");
});
