// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnnotationList } from "../src/features/annotations/AnnotationList";
import { ItemStylePanel } from "../src/features/annotations/ItemStylePanel";
import { addMarker, emptyAnnotations, updateMarker } from "../src/lib/annotations";

afterEach(cleanup);
const NOTE = /Sem descrição/;

describe("AnnotationList: aviso de marcador sem descrição", () => {
  it("aparece uma vez, mesmo com vários marcadores vazios", () => {
    let ann = emptyAnnotations();
    for (const x of [0.1, 0.4, 0.7]) ann = addMarker(ann, { x, y: 0.5 });
    render(<AnnotationList annotations={ann} pages={[]} selectedId={null} onSelect={() => {}} onChange={() => {}} />);
    expect(screen.getAllByText(NOTE)).toHaveLength(1);
  });

  it("some quando todos têm descrição", () => {
    let ann = addMarker(emptyAnnotations(), { x: 0.1, y: 0.5 });
    ann = updateMarker(ann, ann.markers[0]?.id ?? "", "Botão");
    render(<AnnotationList annotations={ann} pages={[]} selectedId={null} onSelect={() => {}} onChange={() => {}} />);
    expect(screen.queryByText(NOTE)).toBeNull();
  });
});

describe("AnnotationList: Enter no item abre o painel Estilo", () => {
  it("Enter no campo do marcador chama onOpenStyle", () => {
    const ann = addMarker(emptyAnnotations(), { x: 0.1, y: 0.5 });
    const open = vi.fn();
    render(
      <AnnotationList
        annotations={ann}
        pages={[]}
        selectedId={null}
        onSelect={() => {}}
        onChange={() => {}}
        onOpenStyle={open}
      />,
    );
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(open).toHaveBeenCalledTimes(1);
  });
});

describe("ItemStylePanel: excluir e Esc", () => {
  it("o botão Excluir chama onDelete", () => {
    const del = vi.fn();
    render(
      <ItemStylePanel
        kind="marker"
        name="Marcador 1"
        style={undefined}
        imageStyle={undefined}
        onChange={() => {}}
        onDelete={del}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Excluir marcador 1/i }));
    expect(del).toHaveBeenCalledTimes(1);
  });
});

describe("AnnotationList: foco na legenda do marcador novo (T-156)", () => {
  const props = { pages: [], selectedId: null, onSelect: () => {}, onChange: () => {} };

  it("criar um marcador leva o foco ao campo dele", () => {
    const one = addMarker(emptyAnnotations(), { x: 0.1, y: 0.5 });
    const { rerender } = render(<AnnotationList annotations={one} {...props} />);
    expect(document.activeElement).toBe(document.body);
    rerender(<AnnotationList annotations={addMarker(one, { x: 0.4, y: 0.5 })} {...props} />);
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: /marcador 2/i }));
  });

  it("marcar um destaque não rouba o foco", () => {
    const one = addMarker(emptyAnnotations(), { x: 0.1, y: 0.5 });
    const { rerender } = render(<AnnotationList annotations={one} {...props} />);
    rerender(<AnnotationList annotations={{ ...one, highlights: [{ id: "h", x: 0, y: 0, w: 0.1, h: 0.1 }] }} {...props} />);
    expect(document.activeElement).toBe(document.body);
  });
});
