import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addPage, createManual, exportManual, readManual, setManualLogo, setManualTheme } from "../src/core/index.js";

let workspace: string;
let dir: string;
const PNG = new Uint8Array([137, 80, 78, 71, 1, 2, 3]);
const SVG = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-logo-"));
  dir = (await createManual(workspace, { title: "Manual", language: "pt-BR" })).dir;
  await addPage(dir, { title: "A", body: "texto" });
});
afterEach(() => rm(workspace, { recursive: true, force: true }));

const exportHtml = async () => readFile(path.join(dir, (await exportManual(dir, "html")).file), "utf8");

describe("logo do cliente", () => {
  it("grava o logo em assets/ e guarda o caminho no tema", async () => {
    const logo = await setManualLogo(dir, "Logo Cliente.png", PNG);
    expect(logo).toMatch(/^assets\/logo-cliente.*\.png$/);
    expect((await readManual(dir)).theme).toEqual({ logo });
    expect(await readFile(path.join(dir, logo))).toEqual(Buffer.from(PNG));
  });

  it.each(["a.png", "a.jpg", "a.jpeg", "a.svg"])("aceita %s", async (name) => {
    await expect(setManualLogo(dir, name, PNG)).resolves.toMatch(/^assets\//);
  });

  it.each(["a.gif", "a.webp", "a.exe", "a.html", "semextensao"])("recusa %s dizendo o motivo", async (name) => {
    const err = await setManualLogo(dir, name, PNG).catch((e: unknown) => e);
    expect(err).toMatchObject({ code: "logo-type" });
    expect((err as Error).message).toMatch(/PNG, JPG ou SVG/);
    expect((await readManual(dir)).theme).toBeUndefined();
  });

  it("recusa arquivo acima de 1 MB e aceita exatamente 1 MB", async () => {
    await expect(setManualLogo(dir, "a.png", new Uint8Array(1024 * 1024))).resolves.toMatch(/^assets\//);
    const err = await setManualLogo(dir, "b.png", new Uint8Array(1024 * 1024 + 1)).catch((e: unknown) => e);
    expect(err).toMatchObject({ code: "logo-size", params: { max: 1 } });
    expect((err as Error).message).toMatch(/1 MB/);
  });

  it("caminho do logo fica só em assets/, sem .. e só PNG, JPG ou SVG", async () => {
    for (const bad of [
      "../x.png",
      "assets/../x.png",
      "/etc/x.png",
      "pages/x.png",
      "assets/sub/x.png",
      "assets/x.gif",
      "assets\\x.png",
      5,
    ]) {
      await expect(setManualTheme(dir, { logo: bad as string })).rejects.toThrow();
    }
    await expect(setManualTheme(dir, { logo: "assets/nao-existe.png" })).rejects.toThrow(/não existe/);
    await writeFile(path.join(dir, "assets", "big.png"), new Uint8Array(1024 * 1024 + 1));
    await expect(setManualTheme(dir, { logo: "assets/big.png" })).rejects.toThrow(/1 MB/);
    expect((await readManual(dir)).theme).toBeUndefined();
  });

  it("o export copia o logo e mostra na capa e no topo do sumário, por <img>, sem URL externa", async () => {
    const logo = await setManualLogo(dir, "marca.svg", SVG);
    const html = await exportHtml();
    expect(html.match(new RegExp(`<img class="logo[^>]*src="${logo}"`, "g"))).toHaveLength(2);
    expect(html).toMatch(/<header class="cover">\s*<img class="logo/);
    expect(html).toMatch(/<nav class="toc"[^>]*>\s*<img class="logo/);
    expect(html).not.toContain("<script");
    expect(html).not.toMatch(/(?:src|href)="https?:/);
    expect(await readFile(path.join(dir, "exportacao/html", logo), "utf8")).toContain("<svg");
  });

  it("logo grande não estoura a capa: tamanho máximo no CSS", async () => {
    await setManualLogo(dir, "marca.png", PNG);
    const html = await exportHtml();
    expect(html).toMatch(/\.cover \.logo\{[^}]*max-height:\d+px[^}]*max-width/);
    expect(html).toMatch(/\.toc \.logo\{[^}]*max-height/);
  });

  it("sem logo o HTML não muda", async () => {
    expect(await exportHtml()).not.toContain('class="logo');
  });

  it("logo sumido do disco vira aviso e o export continua", async () => {
    const logo = await setManualLogo(dir, "marca.png", PNG);
    await rm(path.join(dir, logo));
    const res = await exportManual(dir, "html");
    expect(res.warnings.join()).toContain(`Logo não encontrado: ${logo}`);
    expect(await readFile(path.join(dir, res.file), "utf8")).not.toContain('class="logo');
  });

  it("remover o logo não apaga cores e fontes, e o contrário também", async () => {
    await setManualTheme(dir, { accent: "#0f7a55", fonts: { text: "lora" } });
    const logo = await setManualLogo(dir, "marca.png", PNG);
    await setManualTheme(dir, { accent: null });
    expect((await readManual(dir)).theme).toEqual({ fonts: { text: "lora" }, logo });
    await setManualTheme(dir, { headings: null, fonts: null });
    expect((await readManual(dir)).theme).toEqual({ logo });
    await setManualTheme(dir, { accent: "#0f7a55", fonts: { text: "lora" } });
    await setManualTheme(dir, { logo: null });
    expect((await readManual(dir)).theme).toEqual({ accent: "#0f7a55", fonts: { text: "lora" } });
    await setManualTheme(dir, { accent: null, fonts: null });
    expect((await readManual(dir)).theme).toBeUndefined();
  });
});
