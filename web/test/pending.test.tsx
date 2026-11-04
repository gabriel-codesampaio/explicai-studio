// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pending } from "../src/features/annotations/Pending";

afterEach(cleanup);

describe("Pending: painel pendente", () => {
  it("com a ferramenta inativa mostra só o cabeçalho, com o estado no nome", () => {
    render(
      <Pending open={false} title="Ocultar dados" status="1 área a ocultar" onToggle={() => {}}>
        <p>corpo</p>
      </Pending>,
    );
    expect(screen.queryByText("corpo")).toBeNull();
    expect(screen.getByRole("button", { name: /Ocultar dados\s*1 área a ocultar/ }).getAttribute("aria-expanded")).toBe("false");
  });

  it("com a ferramenta ativa mostra o corpo, e o cabeçalho continua clicável", () => {
    const onToggle = vi.fn();
    render(
      <Pending open title="Ocultar dados" status="1 área a ocultar" onToggle={onToggle}>
        <p>corpo</p>
      </Pending>,
    );
    expect(screen.getByText("corpo")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Ocultar dados/ }));
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
