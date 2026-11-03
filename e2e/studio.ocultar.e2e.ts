import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { type APIRequestContext, expect, type Locator, type Page, test } from "@playwright/test";

// T-116: ferramenta Ocultar. Arrasta, aplica, reabre o arquivo gravado e mede os pixels.
const PNG = readFileSync(path.join(import.meta.dirname, "fixtures", "tela.png"));

async function withImage(request: APIRequestContext, title: string, name = "tela.png", data: Buffer = PNG) {
  const manual = await (await request.post("/api/manuals", { data: { title } })).json();
  const slug = manual.slug as string;
  const body = `Antes.\n\n![Tela](../assets/${name})\n\nDepois.`;
  const created = await (await request.post(`/api/manuals/${slug}/pages`, { data: { title: "Tela", body } })).json();
  const up = await request.post(`/api/manuals/${slug}/assets?name=${name}`, { data });
  expect((await up.json()).path).toBe(`assets/${name}`);
  return { slug, id: created.id as string, body };
}

/** Pasta do manual no disco: o servidor do e2e guarda tudo numa pasta temporária `explicai-e2e-*`. */
function manualDir(slug: string): string {
  const root = readdirSync(tmpdir())
    .filter((d) => d.startsWith("explicai-e2e-"))
    .map((d) => path.join(tmpdir(), d))
    .find((d) => existsSync(path.join(d, slug)));
  if (!root) throw new Error("pasta do manual não encontrada");
  return path.join(root, slug);
}

async function openEditor(page: Page, slug: string, id: string) {
  await page.goto(`/#/${slug}/${id}`);
  await page.getByRole("textbox", { name: "Conteúdo da página" }).locator(".node-image img").first().click();
  await page.getByRole("button", { name: "Editar imagem" }).click();
  return page.getByRole("dialog", { name: "Editar imagem" });
}

/** Arrasta sobre a imagem do editor, em frações dela. Devolve a caixa da imagem. */
async function dragOn(page: Page, dialog: Locator, a: [number, number], b: [number, number]) {
  const box = await dialog.getByRole("img").boundingBox();
  if (!box) throw new Error("sem caixa");
  await page.mouse.move(box.x + box.width * a[0], box.y + box.height * a[1]);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * b[0], box.y + box.height * b[1], { steps: 5 });
  await page.mouse.up();
  return box;
}

/** Guarda os pixels do arquivo em disco (relido do servidor, sem cache) para comparar depois. */
const snapshot = (page: Page, url: string) =>
  page.evaluate(async (u) => {
    const bmp = await createImageBitmap(await (await fetch(u, { cache: "reload" })).blob());
    const c = new OffscreenCanvas(bmp.width, bmp.height);
    const ctx = c.getContext("2d");
    ctx?.drawImage(bmp, 0, 0);
    (globalThis as unknown as { __px: unknown }).__px = ctx?.getImageData(0, 0, bmp.width, bmp.height);
  }, url);

interface Frac {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Relê o arquivo e conta pixels errados: dentro da área (menos 2 px de borda) fora da cor da tarja, e fora dela (mais 2 px) que mudaram. */
const measure = (page: Page, url: string, r: Frac) =>
  page.evaluate(
    async ([u, k]) => {
      const before = (globalThis as unknown as { __px: ImageData }).__px;
      const bmp = await createImageBitmap(await (await fetch(u as string, { cache: "reload" })).blob());
      const c = new OffscreenCanvas(bmp.width, bmp.height);
      const ctx = c.getContext("2d");
      ctx?.drawImage(bmp, 0, 0);
      const now = ctx?.getImageData(0, 0, bmp.width, bmp.height);
      if (!now) throw new Error("sem canvas");
      const f = k as Frac;
      const [x0, y0, x1, y1] = [f.x * bmp.width, f.y * bmp.height, (f.x + f.w) * bmp.width, (f.y + f.h) * bmp.height];
      let insideBad = 0;
      let outsideChanged = 0;
      let insideCount = 0;
      for (let y = 0; y < bmp.height; y++) {
        for (let x = 0; x < bmp.width; x++) {
          const i = (y * bmp.width + x) * 4;
          if (x >= x0 + 2 && x < x1 - 2 && y >= y0 + 2 && y < y1 - 2) {
            insideCount++;
            if (![21, 26, 51, 255].every((v, j) => now.data[i + j] === v)) insideBad++;
          } else if (x < x0 - 2 || x >= x1 + 2 || y < y0 - 2 || y >= y1 + 2) {
            if (![0, 1, 2, 3].every((j) => now.data[i + j] === before.data[i + j])) outsideChanged++;
          }
        }
      }
      return { size: [bmp.width, bmp.height], insideBad, outsideChanged, insideCount };
    },
    [url, r] as const,
  );

test.describe("ocultar dados", () => {
  test("a tecla O escolhe a ferramenta; Aplicar começa desabilitado", async ({ page, request }) => {
    const { slug, id } = await withImage(request, `Ocultar Atalho ${Date.now()}`);
    const dialog = await openEditor(page, slug, id);
    await page.keyboard.press("o");
    await expect(dialog.getByRole("button", { name: "Ocultar", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(dialog.getByRole("button", { name: "Aplicar ocultação" })).toBeDisabled();
  });

  test("arrasta, desfaz, cancela e aplica: pixels tarjados, arquivo limpo, sem cópia em assets/", async ({ page, request }) => {
    const { slug, id, body } = await withImage(request, `Ocultar Aplicar ${Date.now()}`);
    const url = `/files/${slug}/assets/tela.png`;
    const dialog = await openEditor(page, slug, id);
    const before = readFileSync(path.join(manualDir(slug), "assets", "tela.png"));
    await snapshot(page, url);

    await dialog.getByRole("button", { name: "Ocultar", exact: true }).click();
    // O primeiro retângulo é desfeito; o segundo fica.
    await dragOn(page, dialog, [0.1, 0.1], [0.2, 0.2]);
    await expect(dialog.getByText("1 área a ocultar")).toBeVisible();
    await dialog.getByRole("button", { name: "Desfazer" }).click();
    await expect(dialog.getByText("Arraste sobre o dado que deve sumir.")).toBeVisible();
    const box = await dragOn(page, dialog, [0.25, 0.3], [0.6, 0.45]);
    await expect(dialog.getByText("1 área a ocultar")).toBeVisible();
    // Fora da numeração e da legenda.
    await expect(dialog.getByRole("heading", { name: "Legenda" })).toHaveCount(0);
    const shape = await dialog.locator("[data-redaction]").boundingBox();
    if (!shape) throw new Error("sem tarja");
    const rect = {
      x: (shape.x - box.x) / box.width,
      y: (shape.y - box.y) / box.height,
      w: shape.width / box.width,
      h: shape.height / box.height,
    };

    // Cancelar a confirmação não muda nada.
    await dialog.getByRole("button", { name: "Aplicar ocultação" }).click();
    const confirm = page.getByRole("dialog", { name: "Ocultar as áreas marcadas?" });
    await expect(confirm).toContainText("não dá para voltar");
    await expect(confirm).toContainText("Exportações anteriores");
    await confirm.getByRole("button", { name: "Cancelar" }).click();
    await expect(confirm).toHaveCount(0);
    expect(readFileSync(path.join(manualDir(slug), "assets", "tela.png"))).toEqual(before);

    // Aplicar de verdade.
    await dialog.getByRole("button", { name: "Aplicar ocultação" }).click();
    await confirm.getByRole("button", { name: "Ocultar e apagar o original" }).click();
    await expect(dialog.getByText("Arraste sobre o dado que deve sumir.")).toBeVisible();

    const m = await measure(page, url, rect);
    expect(m.size).toEqual([512, 512]);
    expect(m.insideCount).toBeGreaterThan(1000);
    expect(m.insideBad).toBe(0);
    expect(m.outsideChanged).toBe(0);

    const dir = manualDir(slug);
    const after = readFileSync(path.join(dir, "assets", "tela.png"));
    expect(after.equals(before)).toBe(false);
    expect(after.subarray(-8, -4).toString("ascii")).toBe("IEND"); // nenhum byte depois do IEND
    expect(after.includes("eXIf")).toBe(false);
    expect(readdirSync(path.join(dir, "assets"))).toEqual(["tela.png"]);
    // A página continua apontando para o mesmo arquivo.
    const pageNow = await (await request.get(`/api/manuals/${slug}/pages/${id}`)).json();
    expect(pageNow.body).toBe(body);
  });

  test("desfoque: aviso visível, dentro muda, fora não, tamanho se mantém", async ({ page, request }) => {
    const { slug, id } = await withImage(request, `Ocultar Desfoque ${Date.now()}`);
    const url = `/files/${slug}/assets/tela.png`;
    const dialog = await openEditor(page, slug, id);
    await snapshot(page, url);
    await dialog.getByRole("button", { name: "Ocultar", exact: true }).click();
    await expect(dialog.getByRole("radio", { name: "Tarja" })).toHaveAttribute("aria-checked", "true");
    await expect(dialog.getByText("prefira a tarja")).toHaveCount(0);
    await dialog.getByRole("radio", { name: "Desfoque" }).click();
    await expect(dialog.getByText("Para senha, CPF e números, prefira a tarja.")).toBeVisible();
    const box = await dragOn(page, dialog, [0.25, 0.3], [0.6, 0.45]);
    const shape = await dialog.locator("[data-redaction]").boundingBox();
    if (!shape) throw new Error("sem área");
    const r = {
      x: (shape.x - box.x) / box.width,
      y: (shape.y - box.y) / box.height,
      w: shape.width / box.width,
      h: shape.height / box.height,
    };
    await dialog.getByRole("button", { name: "Aplicar ocultação" }).click();
    await page
      .getByRole("dialog", { name: "Ocultar as áreas marcadas?" })
      .getByRole("button", { name: "Ocultar e apagar o original" })
      .click();
    await expect(dialog.getByText("Arraste sobre o dado que deve sumir.")).toBeVisible();
    const m = await page.evaluate(
      async ([u, k]) => {
        const before = (globalThis as unknown as { __px: ImageData }).__px;
        const bmp = await createImageBitmap(await (await fetch(u as string, { cache: "reload" })).blob());
        const c = new OffscreenCanvas(bmp.width, bmp.height);
        const ctx = c.getContext("2d");
        ctx?.drawImage(bmp, 0, 0);
        const now = ctx?.getImageData(0, 0, bmp.width, bmp.height);
        if (!now) throw new Error("sem canvas");
        const f = k as Frac;
        const [x0, y0, x1, y1] = [f.x * bmp.width, f.y * bmp.height, (f.x + f.w) * bmp.width, (f.y + f.h) * bmp.height];
        let insideChanged = 0;
        let insideCount = 0;
        let outsideChanged = 0;
        for (let y = 0; y < bmp.height; y++)
          for (let x = 0; x < bmp.width; x++) {
            const i = (y * bmp.width + x) * 4;
            const same = [0, 1, 2, 3].every((j) => now.data[i + j] === before.data[i + j]);
            if (x >= x0 + 2 && x < x1 - 2 && y >= y0 + 2 && y < y1 - 2) {
              insideCount++;
              if (!same) insideChanged++;
            } else if ((x < x0 - 2 || x >= x1 + 2 || y < y0 - 2 || y >= y1 + 2) && !same) outsideChanged++;
          }
        return { size: [bmp.width, bmp.height], insideChanged, insideCount, outsideChanged };
      },
      [url, r] as const,
    );
    expect(m.size).toEqual([512, 512]);
    expect(m.insideCount).toBeGreaterThan(1000);
    expect(m.insideChanged).toBeGreaterThan(m.insideCount * 0.2);
    expect(m.outsideChanged).toBe(0);
  });

  test("sair com área não aplicada pergunta antes", async ({ page, request }) => {
    const { slug, id } = await withImage(request, `Ocultar Sair ${Date.now()}`);
    const dialog = await openEditor(page, slug, id);
    await dialog.getByRole("button", { name: "Ocultar", exact: true }).click();
    await dragOn(page, dialog, [0.2, 0.2], [0.5, 0.4]);
    await dialog.getByRole("button", { name: "Cancelar" }).click();
    const ask = page.getByRole("dialog", { name: "Sair sem ocultar?" });
    await expect(ask).toBeVisible();
    await ask.getByRole("button", { name: "Continuar editando" }).click();
    await expect(dialog.getByText("1 área a ocultar")).toBeVisible();
    await dialog.getByRole("button", { name: "Cancelar" }).click();
    await ask.getByRole("button", { name: "Sair e descartar" }).click();
    await expect(dialog).toHaveCount(0);
  });

  test("SVG: o botão recusa com mensagem e o arquivo fica igual", async ({ page, request }) => {
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#09f"/></svg>',
    );
    const { slug, id } = await withImage(request, `Ocultar Svg ${Date.now()}`, "tela.svg", svg);
    const dialog = await openEditor(page, slug, id);
    await dialog.getByRole("button", { name: "Ocultar", exact: true }).click();
    await dragOn(page, dialog, [0.2, 0.2], [0.5, 0.4]);
    await dialog.getByRole("button", { name: "Aplicar ocultação" }).click();
    await expect(dialog.getByRole("alert")).toContainText("SVG ou GIF");
    expect(readFileSync(path.join(manualDir(slug), "assets", "tela.svg"))).toEqual(svg);
  });

  test("pasta em git mostra o aviso fixo", async ({ page, request }) => {
    const { slug, id } = await withImage(request, `Ocultar Git ${Date.now()}`);
    mkdirSync(path.join(manualDir(slug), ".git"));
    const dialog = await openEditor(page, slug, id);
    await dialog.getByRole("button", { name: "Ocultar", exact: true }).click();
    await expect(dialog.getByRole("note")).toContainText("está no git");
  });
});
