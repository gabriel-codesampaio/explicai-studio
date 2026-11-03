// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MobileBar } from "../src/layout/Navigation";

afterEach(cleanup);

describe("MobileBar: marca", () => {
  it("fica exposta com a gaveta fechada", () => {
    render(<MobileBar title="Manual" onOpen={() => {}} />);
    expect(screen.getAllByRole("img", { name: "Explicaí Studio" })).toHaveLength(1);
  });

  it("some da árvore de acessibilidade com a gaveta aberta", () => {
    render(<MobileBar title="Manual" onOpen={() => {}} drawerOpen />);
    expect(screen.queryAllByRole("img", { name: "Explicaí Studio" })).toHaveLength(0);
  });
});
