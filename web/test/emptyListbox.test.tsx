// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { SlashMenu } from "../src/features/editor/slash/SlashMenu";

afterEach(cleanup);

it("menu / sem resultado mostra texto comum e nenhum listbox", () => {
  render(<SlashMenu items={[]} command={() => {}} />);
  expect(screen.getByText(/Nenhum bloco/)).toBeTruthy();
  expect(screen.queryByRole("listbox")).toBeNull();
});
