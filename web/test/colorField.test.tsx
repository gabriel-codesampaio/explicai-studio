// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ColorField } from "../src/features/settings/ColorField";

afterEach(cleanup);
const MSG = "A cor de texto tem contraste 1,2:1 com o branco; o mínimo é 4,5:1. Escolha uma cor mais escura.";

describe("ColorField: erro de contraste", () => {
  it("mostra o erro ligado ao campo e o remove ao editar", async () => {
    const onCommit = vi.fn().mockRejectedValue(new Error(MSG));
    render(<ColorField label="Cor do texto" value={undefined} fallback="#151a33" onCommit={onCommit} />);
    const input = screen.getByLabelText("Cor do texto: código da cor");
    fireEvent.change(input, { target: { value: "#eeeeee" } });
    fireEvent.blur(input);
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe(MSG);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(alert.id);
    fireEvent.change(input, { target: { value: "#151a3" } });
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(input.getAttribute("aria-invalid")).toBeNull();
  });
});
