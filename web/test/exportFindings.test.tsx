// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { kindFix, kindLabel } from "../src/features/check/findingText";
import { ExportFindings } from "../src/features/export/ExportFindings";
import type { CheckFinding, CheckKind } from "../src/lib/api";

afterEach(cleanup);

const f = (kind: string, detail = "x"): CheckFinding => ({ pageId: "p1", title: "Entrada", kind: kind as CheckKind, detail });

it("lista o achado com como resolver e abre a página", async () => {
  const open = vi.fn();
  render(<ExportFindings findings={[f("dead-link", "Link para página que não existe: zzz")]} onOpenPage={open} />);
  expect(screen.getByRole("heading", { name: /Checagem do manual · 1 achado/ })).toBeTruthy();
  expect(screen.getByText(/não impedem de exportar/)).toBeTruthy();
  expect(screen.getByText(kindFix("dead-link"))).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: /Abrir página Entrada/ }));
  expect(open).toHaveBeenCalledWith("p1");
});

it("sem achados diz 'Nenhum achado.'", () => {
  render(<ExportFindings findings={[]} onOpenPage={vi.fn()} />);
  expect(screen.getByText("Nenhum achado.")).toBeTruthy();
});

it("not-reviewed (T-545) tem texto claro mesmo sem o tipo no CheckKind", () => {
  expect(kindLabel("not-reviewed" as CheckKind)).toBe("Página ainda sem conferência");
  render(<ExportFindings findings={[f("not-reviewed")]} onOpenPage={vi.fn()} />);
  expect(screen.getByText("Leia a página e marque como conferida.")).toBeTruthy();
});

it("tipo desconhecido não quebra a lista", () => {
  render(<ExportFindings findings={[f("novo-tipo", "detalhe")]} onOpenPage={vi.fn()} />);
  expect(screen.getByText("novo-tipo")).toBeTruthy();
});
