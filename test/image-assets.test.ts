import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addPage, createManual, exportManual, saveAsset, writeAnnotations } from "../src/core/index.js";

let workspace: string;
let dir: string;
beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-img-"));
  dir = (await createManual(workspace, { title: "M", language: "pt-BR" })).dir;
});
afterEach(() => rm(workspace, { recursive: true, force: true }));

const bytes = new Uint8Array([1, 2, 3]);

describe("entrada de imagem: tipos e nomes", () => {
  it.each(["a.png", "a.jpg", "a.jpeg", "a.gif", "a.webp", "a.svg", "FOTO.PNG"])("aceita %s", async (name) => {
    expect(await saveAsset(dir, name, bytes)).toMatch(/^assets\/.+\.(png|jpe?g|gif|webp|svg)$/);
  });

  it.each(["a.heic", "a.txt", "a.exe", "a.pdf", "semextensao"])("recusa %s", async (name) => {
    await expect(saveAsset(dir, name, bytes)).rejects.toThrow(/Formato de imagem/);
  });

  it("nome com acento e espaço vira ASCII sem espaço e o arquivo abre", async () => {
    const asset = await saveAsset(dir, "Captura de tela ação.png", bytes);
    expect(asset).toMatch(/^assets\/[a-z0-9-]+\.png$/);
    expect(await readFile(path.join(dir, asset))).toEqual(Buffer.from(bytes));
  });

  it("a mesma imagem duas vezes gera dois arquivos, sem sobrescrever", async () => {
    const a = await saveAsset(dir, "tela.png", new Uint8Array([1]));
    const b = await saveAsset(dir, "tela.png", new Uint8Array([2]));
    expect(a).not.toBe(b);
    expect(await readFile(path.join(dir, a))).toEqual(Buffer.from([1]));
    expect(await readFile(path.join(dir, b))).toEqual(Buffer.from([2]));
  });
});

describe("exportação com imagem", () => {
  const annotated = async () => {
    const asset = await saveAsset(dir, "tela.png", bytes);
    await writeAnnotations(dir, asset, {
      version: 1,
      markers: [{ id: "m1", n: 1, x: 0.5, y: 0.5, label: "Botão Novo" }],
      highlights: [],
      arrows: [],
      hotspots: [],
    });
    await addPage(dir, { title: "P", body: `![Tela](../${asset})` });
  };

  it("HTML leva a imagem e o marcador; Markdown leva a imagem e a legenda", async () => {
    await annotated();
    const html = await exportManual(dir, "html");
    expect(await readFile(path.join(dir, html.file), "utf8")).toContain("Botão Novo");
    const md = await exportManual(dir, "markdown");
    expect(await readFile(path.join(dir, md.file), "utf8")).toMatch(/!\[Tela\]\(assets\/tela\.png\)[\s\S]*1\. Botão Novo/);
    expect(await readFile(path.join(dir, "exportacao/markdown/assets/tela.png"))).toEqual(Buffer.from(bytes));
  });

  it.each(["html", "markdown"] as const)("imagem que sumiu: %s sai e o resultado traz um aviso", async (format) => {
    await addPage(dir, { title: "P", body: "![Sumiu](../assets/sumiu.png)" });
    const result = await exportManual(dir, format);
    expect(result.warnings.join("\n")).toContain("assets/sumiu.png");
  });
});
