import { existsSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { type APIRequestContext, expect, type Page, test } from "@playwright/test";

// T-119: Reduzir resolução. Imagem grande é gerada no navegador (canvas), enviada e reduzida pela tela.
const SMALL = readFileSync(path.join(import.meta.dirname, "fixtures", "tela.png"));
const MARKERS = {
  version: 1,
  markers: [{ id: "m1", n: 1, x: 0.4, y: 0.6, label: "Ponto" }],
  highlights: [],
  arrows: [],
  hotspots: [],
  display: "m",
};

async function bigPng(page: Page): Promise<Buffer> {
  await page.goto("/");
  const b64 = await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 2400;
    c.height = 1200;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("canvas");
    for (let x = 0; x < 2400; x += 40) {
      ctx.fillStyle = `hsl(${(x / 2400) * 360} 70% 50%)`;
      ctx.fillRect(x, 0, 40, 1200);
    }
    const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, "image/png"));
    const bytes = new Uint8Array(await (blob as Blob).arrayBuffer());
    let s = "";
    for (const b of bytes) s += String.fromCharCode(b);
    return btoa(s);
  });
  return Buffer.from(b64, "base64");
}

async function withImage(request: APIRequestContext, title: string, png: Buffer) {
  const manual = await (await request.post("/api/manuals", { data: { title } })).json();
  const slug = manual.slug as string;
  const created = await (
    await request.post(`/api/manuals/${slug}/pages`, {
      data: { title: "Tela", body: "Antes.\n\n![Tela](../assets/tela.png)\n\nDepois." },
    })
  ).json();
  await request.post(`/api/manuals/${slug}/assets?name=tela.png`, { data: png });
  await request.put(`/api/manuals/${slug}/annotations?asset=assets/tela.png`, { data: MARKERS });
  return { slug, id: created.id as string };
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
  await page.reload();
  await page.getByRole("textbox", { name: "Conteúdo da página" }).locator(".node-image img").first().click();
  await page.getByRole("button", { name: "Editar imagem" }).click();
  return page.getByRole("dialog", { name: "Editar imagem" });
}

const pngSize = (file: Buffer): [number, number] => [file.readUInt32BE(16), file.readUInt32BE(20)];

test.describe("reduzir resolução", () => {
  test("imagem pequena não oferece reduzir", async ({ page, request }) => {
    const { slug, id } = await withImage(request, `Reduzir Pequena ${Date.now()}`, SMALL);
    const dialog = await openEditor(page, slug, id);
    await expect(dialog.getByRole("button", { name: "Salvar marcações" })).toBeVisible();
    await expect(dialog.getByRole("region", { name: "Reduzir imagem" })).toHaveCount(0);
  });

  test("mostra tamanho e prévia, recusa ampliar, aplica e mantém as marcações", async ({ page, request }) => {
    const big = await bigPng(page);
    const { slug, id } = await withImage(request, `Reduzir Aplicar ${Date.now()}`, big);
    const file = path.join(manualDir(slug), "assets", "tela.png");
    const dialog = await openEditor(page, slug, id);
    const panel = dialog.getByRole("region", { name: "Reduzir imagem" });
    await expect(panel).toContainText("2400 × 1200 px");
    await expect(panel.getByLabel("Largura (px)")).toHaveValue("1600");
    await expect(panel).toContainText(/Depois: 1600 × 800 px, ~\d+ KB/);

    await panel.getByLabel("Largura (px)").fill("2400");
    await expect(panel.getByRole("button", { name: "Reduzir", exact: true })).toBeDisabled();
    await panel.getByLabel("Largura (px)").fill("1600");

    await panel.getByRole("button", { name: "Reduzir", exact: true }).click();
    const confirm = page.getByRole("dialog", { name: "Reduzir a imagem?" });
    await confirm.getByRole("button", { name: "Cancelar" }).click();
    expect(pngSize(readFileSync(file))).toEqual([2400, 1200]);

    await panel.getByRole("button", { name: "Reduzir", exact: true }).click();
    await confirm.getByRole("button", { name: "Reduzir e apagar o original" }).click();
    await expect(confirm).toHaveCount(0);
    await expect(dialog.getByRole("region", { name: "Reduzir imagem" })).toHaveCount(0);

    const after = readFileSync(file);
    expect(pngSize(after)).toEqual([1600, 800]);
    expect(after.length).toBeLessThan(big.length);
    expect(after.subarray(-8, -4).toString("ascii")).toBe("IEND");
    expect(readdirSync(path.join(manualDir(slug), "assets"))).toEqual(["tela.png", "tela.png.json"]);
    const ann = await (await request.get(`/api/manuals/${slug}/annotations?asset=assets/tela.png`)).json();
    expect(ann.markers).toEqual(MARKERS.markers);
  });
});
