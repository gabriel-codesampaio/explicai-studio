import { existsSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { type APIRequestContext, expect, type Locator, type Page, test } from "@playwright/test";

// T-118: ferramenta Recortar. Arrasta, confirma, relê o arquivo e mede onde as marcações caíram.
const PNG = readFileSync(path.join(import.meta.dirname, "fixtures", "tela.png"));
const SIZE = 512;

const ANNOTATIONS = {
  version: 1,
  markers: [
    { id: "m1", n: 1, x: 0.1, y: 0.1, label: "Fora" },
    { id: "m2", n: 2, x: 0.4, y: 0.4, label: "Dentro A" },
    { id: "m3", n: 3, x: 0.7, y: 0.6, label: "Dentro B" },
  ],
  highlights: [{ id: "h1", x: 0.02, y: 0.02, w: 0.1, h: 0.1 }],
  arrows: [{ id: "a1", from: { x: 0.4, y: 0.4 }, to: { x: 0.95, y: 0.95 } }],
  hotspots: [],
  display: "m",
};

async function withImage(request: APIRequestContext, title: string) {
  const manual = await (await request.post("/api/manuals", { data: { title } })).json();
  const slug = manual.slug as string;
  const body = "Antes.\n\n![Tela](../assets/tela.png)\n\nDepois.";
  const created = await (await request.post(`/api/manuals/${slug}/pages`, { data: { title: "Tela", body } })).json();
  await request.post(`/api/manuals/${slug}/assets?name=tela.png`, { data: PNG });
  await request.put(`/api/manuals/${slug}/annotations?asset=assets/tela.png`, { data: ANNOTATIONS });
  return { slug, id: created.id as string, body };
}

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

async function dragOn(page: Page, dialog: Locator, a: [number, number], b: [number, number]) {
  const box = await dialog.getByRole("img").boundingBox();
  if (!box) throw new Error("sem caixa");
  await page.mouse.move(box.x + box.width * a[0], box.y + box.height * a[1]);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * b[0], box.y + box.height * b[1], { steps: 5 });
  await page.mouse.up();
  return box;
}

const annotations = async (request: APIRequestContext, slug: string) =>
  (await (await request.get(`/api/manuals/${slug}/annotations?asset=assets/tela.png`)).json()) as typeof ANNOTATIONS;

/** Largura e altura do PNG gravado (cabeçalho IHDR). */
const pngSize = (file: Buffer): [number, number] => [file.readUInt32BE(16), file.readUInt32BE(20)];

/** Acha onde o recorte começa no original, comparando pixels (amostra de 7 em 7), perto do palpite. */
const findOrigin = (page: Page, orig: Buffer, cropped: Buffer, gx: number, gy: number) =>
  page.evaluate(
    async ([a64, b64, x0, y0]) => {
      const read = async (b: string) => {
        const bmp = await createImageBitmap(new Blob([Uint8Array.from(atob(b), (c) => c.charCodeAt(0))], { type: "image/png" }));
        const c = new OffscreenCanvas(bmp.width, bmp.height);
        const ctx = c.getContext("2d");
        ctx?.drawImage(bmp, 0, 0);
        return ctx?.getImageData(0, 0, bmp.width, bmp.height) as ImageData;
      };
      const [a, b] = [await read(a64 as string), await read(b64 as string)];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const [ox, oy] = [(x0 as number) + dx, (y0 as number) + dy];
          let same = true;
          for (let y = 0; y < b.height && same; y += 7) {
            for (let x = 0; x < b.width && same; x += 7) {
              for (let k = 0; k < 4; k++) {
                if (a.data[((oy + y) * a.width + ox + x) * 4 + k] !== b.data[(y * b.width + x) * 4 + k]) same = false;
              }
            }
          }
          if (same) return [ox, oy];
        }
      }
      return null;
    },
    [orig.toString("base64"), cropped.toString("base64"), gx, gy] as const,
  );

test.describe("recortar imagem", () => {
  test("a tecla R escolhe a ferramenta; Aplicar começa desabilitado", async ({ page, request }) => {
    const { slug, id } = await withImage(request, `Recortar Atalho ${Date.now()}`);
    const dialog = await openEditor(page, slug, id);
    await page.keyboard.press("r");
    await expect(dialog.getByRole("button", { name: "Recortar", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(dialog.getByRole("button", { name: "Aplicar recorte" })).toBeDisabled();
  });

  test("desfaz, cancela sem mudar nada e aplica: arquivo menor, marcações sobre o mesmo pixel, renumeradas", async ({
    page,
    request,
  }) => {
    const { slug, id, body } = await withImage(request, `Recortar Aplicar ${Date.now()}`);
    const file = path.join(manualDir(slug), "assets", "tela.png");
    const before = readFileSync(file);
    const dialog = await openEditor(page, slug, id);
    await dialog.getByRole("button", { name: "Recortar", exact: true }).click();

    // Primeiro retângulo é desfeito; o segundo fica.
    await dragOn(page, dialog, [0.1, 0.1], [0.2, 0.2]);
    await expect(dialog.getByRole("button", { name: "Aplicar recorte" })).toBeEnabled();
    await dialog.getByRole("button", { name: "Desfazer" }).click();
    await expect(dialog.getByRole("button", { name: "Aplicar recorte" })).toBeDisabled();
    const box = await dragOn(page, dialog, [0.3, 0.3], [0.8, 0.7]);
    const shape = await dialog.locator("[data-crop]").boundingBox();
    if (!shape) throw new Error("sem retângulo");
    const rx = (shape.x - box.x) / box.width;
    const ry = (shape.y - box.y) / box.height;

    // A confirmação lista o que some; cancelar não muda nada.
    await dialog.getByRole("button", { name: "Aplicar recorte" }).click();
    const confirm = page.getByRole("dialog", { name: "Recortar a imagem?" });
    await expect(confirm).toContainText("não dá para voltar");
    await expect(confirm).toContainText("3 marcações serão removidas: 1 marcador, 1 destaque, 1 seta");
    await confirm.getByRole("button", { name: "Cancelar" }).click();
    await expect(confirm).toHaveCount(0);
    expect(readFileSync(file)).toEqual(before);
    expect(await annotations(request, slug)).toMatchObject({ markers: ANNOTATIONS.markers });

    // Aplicar de verdade.
    await dialog.getByRole("button", { name: "Aplicar recorte" }).click();
    await confirm.getByRole("button", { name: "Recortar e apagar o original" }).click();
    await expect(confirm).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Aplicar recorte" })).toBeDisabled();

    const after = readFileSync(file);
    const [w, h] = pngSize(after);
    expect(Math.abs(w - SIZE * 0.5)).toBeLessThanOrEqual(2);
    expect(Math.abs(h - SIZE * 0.4)).toBeLessThanOrEqual(2);
    expect(after.subarray(-8, -4).toString("ascii")).toBe("IEND");
    expect(after.includes("eXIf")).toBe(false);
    expect(readdirSync(path.join(manualDir(slug), "assets"))).toEqual(["tela.png", "tela.png.json"]);

    // Os pixels são um pedaço exato do original (a origem varia até 1 px do arrasto).
    const origin = await findOrigin(page, before, after, Math.round(rx * SIZE), Math.round(ry * SIZE));
    expect(origin).not.toBeNull();
    const [ox, oy] = origin as number[];

    // Cada marcador que ficou cai sobre o mesmo pixel de antes (até 1 px de arredondamento).
    const now = await annotations(request, slug);
    expect(now.markers.map((m) => [m.n, m.label])).toEqual([
      [1, "Dentro A"],
      [2, "Dentro B"],
    ]);
    const pairs = [
      [now.markers[0], ANNOTATIONS.markers[1]],
      [now.markers[1], ANNOTATIONS.markers[2]],
    ] as const;
    for (const [m, was] of pairs) {
      if (!m || !was) throw new Error("marcador faltando");
      expect(Math.abs(m.x * w + (ox as number) - was.x * SIZE)).toBeLessThanOrEqual(1);
      expect(Math.abs(m.y * h + (oy as number) - was.y * SIZE)).toBeLessThanOrEqual(1);
    }
    expect(now.highlights).toEqual([]);
    expect(now.arrows).toEqual([]); // uma ponta saía da área
    expect(now.display).toBe("m");

    // A lista do editor segue a numeração nova, e o Markdown não mudou.
    await expect(dialog.getByRole("textbox").first()).toHaveValue("Dentro A");
    await expect(dialog.getByRole("textbox").nth(1)).toHaveValue("Dentro B");
    const pageNow = await (await request.get(`/api/manuals/${slug}/pages/${id}`)).json();
    expect(pageNow.body).toBe(body);
  });
});
