// @vitest-environment happy-dom
import { Editor } from "@tiptap/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { contentExtensions } from "../src/features/editor/extensions";
import { insertImages } from "../src/features/editor/imageUpload";
import { api } from "../src/lib/api";

const file = (name: string) => new File(["x"], name, { type: "image/png" });
const make = (md: string) => new Editor({ extensions: contentExtensions(), content: md, contentType: "markdown" });

afterEach(() => vi.restoreAllMocks());

describe("insertImages", () => {
  it("a imagem entra onde a posição foi parar quando a pessoa digita durante o envio", async () => {
    const editor = make("Fim.");
    let release!: () => void;
    vi.spyOn(api, "uploadAsset").mockImplementation(
      () =>
        new Promise((r) => {
          release = () => r({ path: "assets/a.png" } as never);
        }),
    );
    const done = insertImages(editor, "m", [file("a.png")], 1, () => {});
    editor.commands.insertContentAt(1, "XYZ"); // digita antes do ponto de colagem
    release();
    await done;
    expect(editor.getMarkdown()).toMatch(/^XYZ!\[a\]\(.*a\.png\)?Fim\./);
    editor.destroy();
  });

  it("documento que encolheu não lança e a ordem dos vários arquivos se mantém", async () => {
    const editor = make("Um texto grande aqui.");
    vi.spyOn(api, "uploadAsset").mockImplementation(async (_s, f) => ({ path: `assets/${(f as File).name}` }) as never);
    await insertImages(editor, "m", [file("a.png"), file("b.png")], 3, () => {});
    const md = editor.getMarkdown();
    expect(md.indexOf("a.png")).toBeGreaterThan(-1);
    expect(md.indexOf("a.png")).toBeLessThan(md.indexOf("b.png"));
    editor.destroy();
  });

  it("falha no segundo arquivo avisa e o terceiro ainda entra", async () => {
    const editor = make("Texto.");
    vi.spyOn(api, "uploadAsset").mockImplementation(async (_s, f) => {
      if ((f as File).name === "b.png") throw new Error("rede caiu");
      return { path: `assets/${(f as File).name}` } as never;
    });
    const onError = vi.fn();
    await insertImages(editor, "m", [file("a.png"), file("b.png"), file("c.png")], 1, onError);
    expect(onError).toHaveBeenCalledTimes(1);
    const md = editor.getMarkdown();
    expect(md).toContain("a.png");
    expect(md).toContain("c.png");
    expect(md).not.toContain("b.png");
    editor.destroy();
  });
});
