import { readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { type APIRequestContext, expect, type Page, test } from "@playwright/test";

// T-542: "Trocar imagem" no balão mantém as marcações, avisa se a proporção mudou e guarda o arquivo antigo na lixeira.
const PNG = readFileSync(path.join(import.meta.dirname, "fixtures", "tela.png"));
// Mesma pasta de e2e/workspace.mjs (sem tipos para importar).
const workspace = path.join(tmpdir(), `explicai-e2e-${process.env.E2E_PORT ?? "4400"}`);

const editor = (page: Page) => page.getByRole("textbox", { name: "Conteúdo da página" });
const image = (page: Page) => editor(page).locator(".node-image img");
const disc = (page: Page) => page.locator(".node-image [data-n='1']");

/** PNG sólido de w x h pixels, desenhado no navegador. */
const makePng = async (page: Page, w: number, h: number) =>
  Buffer.from(
    await page.evaluate(
      ({ w, h }) => {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        if (!ctx) throw new Error("canvas");
        ctx.fillStyle = "#e0662b";
        ctx.fillRect(0, 0, w, h);
        return c.toDataURL("image/png").split(",")[1] ?? "";
      },
      { w, h },
    ),
    "base64",
  );

async function setup(request: APIRequestContext, title: string) {
  const manual = await (await request.post("/api/manuals", { data: { title } })).json();
  const slug = manual.slug as string;
  const created = await (
    await request.post(`/api/manuals/${slug}/pages`, { data: { title: "Tela", body: "![Tela](../assets/tela.png)\n" } })
  ).json();
  await request.post(`/api/manuals/${slug}/assets?name=tela.png`, { data: PNG });
  await request.put(`/api/manuals/${slug}/annotations?asset=assets/tela.png`, {
    data: { version: 1, markers: [{ id: "m1", n: 1, x: 0.25, y: 0.75 }], highlights: [], arrows: [], hotspots: [] },
  });
  return { slug, id: created.id as string };
}

const asset = async (request: APIRequestContext, slug: string) =>
  Buffer.from(await (await request.get(`/files/${slug}/assets/tela.png`)).body());
const trashed = (slug: string) =>
  readdirSync(path.join(workspace, slug, ".lixeira")).flatMap((f) =>
    f.startsWith("imagens-") ? readdirSync(path.join(workspace, slug, ".lixeira", f, "assets")) : [],
  );
/** Ponto da marca (em %) e se a camada de marcas tem o tamanho da imagem na tela. */
const overlay = async (page: Page) => {
  const img = (await image(page).boundingBox()) as { width: number; height: number };
  return disc(page).evaluate((el, img) => {
    const pin = el.closest<HTMLElement>('[style*="left"]') as HTMLElement;
    const box = (pin.offsetParent as HTMLElement).getBoundingClientRect();
    return {
      left: pin.style.left,
      top: pin.style.top,
      fits: Math.abs(box.width - img.width) < 2 && Math.abs(box.height - img.height) < 2,
    };
  }, img);
};

test("trocar por imagem de mesma proporção mantém as marcações, guarda a antiga e some sem aviso", async ({ page, request }) => {
  const { slug, id } = await setup(request, "Trocar Mesma");
  await page.goto(`/#/${slug}/${id}`);
  await image(page).click();
  await page.locator('input[name="imagem-nova"]').setInputFiles({
    name: "novo.png",
    mimeType: "image/png",
    buffer: await makePng(page, 256, 256),
  });
  await expect(page.getByText("Imagem trocada.")).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect.poll(async () => (await asset(request, slug)).equals(PNG)).toBe(false);
  await expect.poll(() => image(page).evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBe(256);
  // A imagem encolhe de 512 para 256 px; a camada de marcas acompanha e o disco segue em 25% / 75%.
  await expect.poll(() => overlay(page)).toEqual({ left: "25%", top: "75%", fits: true });
  expect((await (await request.get(`/api/manuals/${slug}/annotations?asset=assets/tela.png`)).json()).markers[0]).toMatchObject({
    x: 0.25,
    y: 0.75,
  });
  expect(trashed(slug)).toEqual(["tela.png"]);
  expect((await (await request.get(`/api/manuals/${slug}/assets/unused`)).json()).count).toBe(0);
  expect(
    readFileSync(path.join(workspace, slug, "pages", readdirSync(path.join(workspace, slug, "pages"))[0] ?? ""), "utf8"),
  ).toContain("../assets/tela.png");
});

test("proporção diferente pede confirmação; Cancelar não troca e Desfazer devolve o antigo", async ({ page, request }) => {
  const { slug, id } = await setup(request, "Trocar Outra");
  await page.goto(`/#/${slug}/${id}`);
  await image(page).click();
  const input = page.locator('input[name="imagem-nova"]');
  const wide = { name: "largo.png", mimeType: "image/png", buffer: await makePng(page, 400, 200) };
  await input.setInputFiles(wide);
  const warning = page.getByRole("alert").filter({ hasText: "proporção" });
  await expect(warning).toBeVisible();
  expect((await asset(request, slug)).equals(PNG)).toBe(true); // nada gravado antes de confirmar
  await warning.getByRole("button", { name: "Cancelar" }).click();
  await expect(warning).toBeHidden();
  expect((await asset(request, slug)).equals(PNG)).toBe(true);

  await input.setInputFiles(wide);
  await warning.getByRole("button", { name: "Trocar mesmo assim" }).click();
  await expect(page.getByText("Imagem trocada.")).toBeVisible();
  await expect.poll(() => image(page).evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBe(400);

  await page.getByRole("button", { name: "Desfazer" }).click();
  await expect.poll(async () => (await asset(request, slug)).equals(PNG)).toBe(true);
  await expect.poll(() => image(page).evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBe(512);
});

test("formato diferente da imagem atual é recusado com mensagem", async ({ page, request }) => {
  const { slug, id } = await setup(request, "Trocar Formato");
  await page.goto(`/#/${slug}/${id}`);
  await image(page).click();
  await page.locator('input[name="imagem-nova"]').setInputFiles({ name: "novo.jpg", mimeType: "image/jpeg", buffer: PNG });
  await expect(page.getByRole("alert").filter({ hasText: "mesmo formato" })).toBeVisible();
  expect((await asset(request, slug)).equals(PNG)).toBe(true);
});
