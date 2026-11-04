// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AnnotationList } from "../src/features/annotations/AnnotationList";
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
