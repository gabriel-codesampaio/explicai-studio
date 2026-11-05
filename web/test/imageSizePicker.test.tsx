// @vitest-environment happy-dom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Annotations } from "../src/lib/annotations";

let current: Annotations | null = null;
const save = vi.fn(async (_s: string, _a: string, ann: Annotations) => {
  current = ann;
});
vi.mock("../src/lib/annotationStore", () => ({
  useAnnotations: () => current,
  saveAnnotations: (...a: Parameters<typeof save>) => save(...a),
}));

import { ImageSizePicker } from "../src/features/annotations/ImageSizePicker";

afterEach(() => {
  cleanup();
  current = null;
});

const base: Annotations = { version: 1, markers: [], highlights: [], arrows: [], hotspots: [] };
const pressed = () =>
  ["Pequena", "Média", "Larga"].filter((n) => screen.getByRole("button", { name: n }).getAttribute("aria-pressed") === "true");

describe("ImageSizePicker: tamanho atual (T-526)", () => {
  it("sem tamanho gravado, Larga é a atual", () => {
    current = base;
    render(<ImageSizePicker slug="m" src="/files/m/assets/a.png" />);
    expect(pressed()).toEqual(["Larga"]);
  });

  it.each([
    ["s", "Pequena"],
    ["m", "Média"],
    ["full", "Larga"],
  ] as const)("display %s marca só %s", (display, name) => {
    current = { ...base, display };
    render(<ImageSizePicker slug="m" src="/files/m/assets/a.png" />);
    expect(pressed()).toEqual([name]);
  });

  it("trocar o tamanho move o destaque", async () => {
    current = { ...base, display: "s" };
    const { rerender } = render(<ImageSizePicker slug="m" src="/files/m/assets/a.png" />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Média" }));
    });
    rerender(<ImageSizePicker slug="m" src="/files/m/assets/a.png" />);
    expect(save).toHaveBeenCalledWith("m", "assets/a.png", expect.objectContaining({ display: "m" }));
    expect(pressed()).toEqual(["Média"]);
  });
});
