// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnnotationCanvas, type Draft, nudgeDraft } from "../src/features/annotations/AnnotationCanvas";
import { emptyAnnotations, type Tool } from "../src/lib/annotations";

afterEach(cleanup);

function setup(tool: Tool, selectedId: string | null = null) {
  const onChange = vi.fn<(next: Draft, id: string | null) => void>();
  render(
    <AnnotationCanvas
      src="/files/m/assets/tela.png"
      alt="Tela"
      draft={{ ann: emptyAnnotations(), redact: [], crop: [] }}
      tool={tool}
      selectedId={selectedId}
      defaultTarget={{ type: "url", href: "https://" }}
      redactStyle={"solid" as never}
      onChange={onChange}
      onSelect={() => {}}
    />,
  );
  const canvas = screen.getByRole("application", { name: "Imagem para marcar" });
  return { onChange, canvas };
}

describe("AnnotationCanvas pelo teclado (T-525)", () => {
  it("o canvas entra na ordem do Tab", () => {
    expect(setup("marker").canvas.tabIndex).toBe(0);
  });

  it("Enter cria um marcador no centro, selecionado, e anuncia", () => {
    const { onChange, canvas } = setup("marker");
    fireEvent.keyDown(canvas, { key: "Enter" });
    const [next, id] = onChange.mock.calls[0] ?? [];
    expect(next?.ann.markers[0]).toMatchObject({ n: 1, x: 0.5, y: 0.5 });
    expect(id).toBe(next?.ann.markers[0]?.id);
    expect(screen.getByRole("status").textContent).toContain("Nova marcação: Marcador 1, em 50% da largura e 50% da altura");
  });

  it("setas movem o cursor antes de criar; Shift anda mais", () => {
    const { onChange, canvas } = setup("marker");
    fireEvent.keyDown(canvas, { key: "ArrowRight" });
    fireEvent.keyDown(canvas, { key: "ArrowDown", shiftKey: true });
    fireEvent.keyDown(canvas, { key: "Enter" });
    const m = onChange.mock.calls[0]?.[0].ann.markers[0];
    expect(m?.x).toBeCloseTo(0.52);
    expect(m?.y).toBeCloseTo(0.6);
  });

  it.each([
    ["highlight", "highlights"],
    ["arrow", "arrows"],
    ["hotspot", "hotspots"],
  ] as const)("Enter cria %s", (tool, list) => {
    const { onChange, canvas } = setup(tool);
    fireEvent.keyDown(canvas, { key: "Enter" });
    expect(onChange.mock.calls[0]?.[0].ann[list]).toHaveLength(1);
  });

  it("perto da borda a forma recua e ainda cabe", () => {
    const { onChange, canvas } = setup("highlight");
    for (let i = 0; i < 30; i++) fireEvent.keyDown(canvas, { key: "ArrowLeft" });
    fireEvent.keyDown(canvas, { key: "Enter" });
    expect(onChange.mock.calls[0]?.[0].ann.highlights[0]?.x).toBeCloseTo(0);
  });

  it("nudgeDraft move área de ocultar e recorte selecionados; id ou tecla estranha não muda nada", () => {
    const area = { id: "r1", x: 0.2, y: 0.2, w: 0.1, h: 0.1 };
    const draft: Draft = { ann: emptyAnnotations(), redact: [area], crop: [{ ...area, id: "c1" }] };
    expect(nudgeDraft(draft, "r1", "ArrowRight", false)?.redact[0]?.x).toBeCloseTo(0.21);
    expect(nudgeDraft(draft, "c1", "ArrowDown", true)?.crop[0]?.y).toBeCloseTo(0.25);
    expect(nudgeDraft(draft, "nada", "ArrowRight", false)).toBeNull();
    expect(nudgeDraft(draft, "r1", "a", false)).toBeNull();
  });

  it("com área de ocultar selecionada, as setas não movem o cursor (movem a área, no editor)", () => {
    const draft: Draft = { ann: emptyAnnotations(), redact: [{ id: "r1", x: 0.2, y: 0.2, w: 0.1, h: 0.1 }], crop: [] };
    const onChange = vi.fn<(next: Draft, id: string | null) => void>();
    render(
      <AnnotationCanvas
        src="/files/m/assets/tela.png"
        alt="Tela"
        draft={draft}
        tool="marker"
        selectedId="r1"
        defaultTarget={{ type: "url", href: "https://" }}
        redactStyle={"solid" as never}
        onChange={onChange}
        onSelect={() => {}}
      />,
    );
    const canvas = screen.getByRole("application", { name: "Imagem para marcar" });
    fireEvent.keyDown(canvas, { key: "ArrowRight" });
    fireEvent.keyDown(canvas, { key: "Enter" });
    expect(onChange.mock.calls[0]?.[0].ann.markers[0]?.x).toBeCloseTo(0.5);
  });

  it("com Selecionar, Enter não cria nada", () => {
    const { onChange, canvas } = setup("select");
    fireEvent.keyDown(canvas, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });
});
