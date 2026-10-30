import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { contrastWithWhite } from "../src/core/export/color.js";
import { themeCss } from "../src/core/export/theme.js";
import { addPage, createManual, exportManual, readManual, setManualTheme } from "../src/core/index.js";

let workspace: string;
let dir: string;

beforeEach(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "explicai-theme-"));
  dir = (await createManual(workspace, { title: "Manual", language: "pt-BR" })).dir;
});
afterEach(() => rm(workspace, { recursive: true, force: true }));

describe("tema do manual", () => {
  it("mudar um campo não apaga os outros", async () => {
    await setManualTheme(dir, { accent: "#0f7a55", text: "#222222" });
    await setManualTheme(dir, { highlight: "#ffe066", headings: { h1: "#7a3fc4" } });
    await setManualTheme(dir, { headings: { h2: "#0f7a55" } });
    expect((await readManual(dir)).theme).toEqual({
      accent: "#0f7a55",
      text: "#222222",
      highlight: "#ffe066",
      headings: { h1: "#7a3fc4", h2: "#0f7a55" },
    });
    await setManualTheme(dir, { text: null, headings: { h1: null, h2: null } });
    expect((await readManual(dir)).theme).toEqual({ accent: "#0f7a55", highlight: "#ffe066" });
  });

  it("recusa texto, título e destaque com menos de 4,5:1 com o branco, dizendo o contraste", async () => {
    expect(contrastWithWhite("#ffffff")).toBe(1);
    await expect(setManualTheme(dir, { accent: "#ffd43b" })).rejects.toThrow(/destaque tem contraste 1,4:1.*mínimo é 4,5:1/);
    await expect(setManualTheme(dir, { text: "#999999" })).rejects.toThrow(/texto tem contraste/);
    await expect(setManualTheme(dir, { headings: { page: "#aaaaaa" } })).rejects.toThrow(/título da página tem contraste/);
    expect((await readManual(dir)).theme).toBeUndefined();
  });

  it("realce escuro demais para o texto por cima é recusado", async () => {
    await expect(setManualTheme(dir, { highlight: "#101040" })).rejects.toThrow(/sobre o realce/);
    await setManualTheme(dir, { highlight: "#ffe066" });
  });

  it("o CSS do tema só muda o que foi escolhido e o export usa", async () => {
    expect(themeCss(undefined)).toBe("");
    await addPage(dir, { title: "A", body: "# Um\n\n## Dois" });
    await setManualTheme(dir, { text: "#222222", highlight: "#ffe066", accent: "#0f7a55", headings: { h1: "#7a3fc4" } });
    const html = await readFile(path.join(dir, (await exportManual(dir, "html")).file), "utf8");
    expect(html).toContain("--tinta:#222222");
    expect(html).toMatch(/--grafite:#[0-9a-f]{6}/);
    expect(html).toContain("--marca:#ffe066");
    expect(html).toContain("--anotacao:#0f7a55");
    expect(html).toContain("--t-h1:#7a3fc4");
    expect(html).toContain('class="t1"');
    expect(html).toContain('class="t2"');
  });

  it("manual sem tema sai com títulos pretos e as cores de hoje", async () => {
    await addPage(dir, { title: "A", body: "# Um" });
    const html = await readFile(path.join(dir, (await exportManual(dir, "html")).file), "utf8");
    expect(html).toContain("--t-page:#000");
    expect(html).toContain("--tinta:#151a33");
    expect(html.split(":root{")).toHaveLength(2); // só o :root da marca, sem sobreposição do tema
  });
});
