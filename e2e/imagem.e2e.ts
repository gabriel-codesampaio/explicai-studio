import { readFileSync } from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { type APIRequestContext, expect, type Page, test } from "@playwright/test";

// QA da imagem do editor (T-064): entrada, edição, marcações, persistência, exportação, tela e robustez.
const PNG = readFileSync(path.join(import.meta.dirname, "fixtures", "tela.png"));
const IMAGE = path.join(import.meta.dirname, "fixtures", "tela.png");
type Upload = { name: string; mimeType: string; buffer: Buffer };
const file = (name: string, mimeType: string, buffer: Buffer = PNG): Upload => ({ name, mimeType, buffer });

async function setup(request: APIRequestContext, title: string, pages: { title: string; body?: string }[] = [{ title: "Tela" }]) {
  const manual = await (await request.post("/api/manuals", { data: { title } })).json();
  const created: { id: string; title: string; file: string }[] = [];
  for (const p of pages) created.push(await (await request.post(`/api/manuals/${manual.slug}/pages`, { data: p })).json());
  return { slug: manual.slug as string, pages: created };
}

const editor = (page: Page) => page.getByRole("textbox", { name: "Conteúdo da página" });
const images = (page: Page) => editor(page).locator(".node-image img");
const fileInput = (page: Page) => page.locator('input[type="file"]');
const saved = (page: Page) => expect(page.getByRole("status")).toContainText("Salvo às");
const serial = (files: Upload[]) => files.map((f) => ({ name: f.name, type: f.mimeType, b64: f.buffer.toString("base64") }));

/** Cola arquivos (e texto, se houver) no editor como se viessem da área de transferência. */
async function paste(page: Page, files: Upload[], text?: string) {
  await editor(page).click();
  await editor(page).evaluate(
    (el, { list, text }) => {
      const dt = new DataTransfer();
      for (const f of list) dt.items.add(new File([Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0))], f.name, { type: f.type }));
      if (text) dt.setData("text/plain", text);
      el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
    },
    { list: serial(files), text },
  );
}

/** Solta arquivos sobre o editor, no ponto (x, y) da tela. */
async function drop(page: Page, files: Upload[], at: { x: number; y: number }) {
  await editor(page).evaluate(
    (el, { list, at }) => {
      const dt = new DataTransfer();
      for (const f of list) dt.items.add(new File([Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0))], f.name, { type: f.type }));
      const init = { dataTransfer: dt, bubbles: true, cancelable: true, clientX: at.x, clientY: at.y };
      el.dispatchEvent(new DragEvent("dragover", init));
      el.dispatchEvent(new DragEvent("drop", init));
    },
    { list: serial(files), at },
  );
}

const srcs = (page: Page) => images(page).evaluateAll((els) => els.map((e) => e.getAttribute("src")));
const loaded = (page: Page) =>
  images(page).evaluateAll((els) => els.every((e) => (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth > 0));

test.describe("entrada", () => {
  test("botão Imagem aceita várias imagens de uma vez, cada uma com seu arquivo", async ({ page, request }) => {
    const { slug } = await setup(request, "Imagem Botao");
    await page.goto(`/#/${slug}`);
    await editor(page).click();
    await fileInput(page).setInputFiles([IMAGE, IMAGE]);
    await expect(images(page)).toHaveCount(2);
    expect(new Set(await srcs(page)).size).toBe(2);
    expect(await loaded(page)).toBe(true);
  });

  test("Ctrl+V com três imagens insere as três", async ({ page, request }) => {
    const { slug } = await setup(request, "Imagem Colar Varias");
    await page.goto(`/#/${slug}`);
    await paste(page, [file("a.png", "image/png"), file("b.png", "image/png"), file("c.png", "image/png")]);
    await expect(images(page)).toHaveCount(3);
    expect(new Set(await srcs(page)).size).toBe(3);
  });

  test("Ctrl+V de imagem junto com texto insere a imagem", async ({ page, request }) => {
    const { slug } = await setup(request, "Imagem Colar Texto");
    await page.goto(`/#/${slug}`);
    await paste(page, [file("print.png", "image/png")], "texto que veio junto");
    await expect(images(page)).toHaveCount(1);
  });

  test("gif e webp são aceitos ao colar, e abrem", async ({ page, request }) => {
    const { slug } = await setup(request, "Imagem Gif Webp");
    await page.goto(`/#/${slug}`);
    await paste(page, [file("animada.gif", "image/gif"), file("foto.webp", "image/webp")]);
    await expect(images(page)).toHaveCount(2);
    expect((await srcs(page)).map((s) => s?.split(".").pop())).toEqual(["gif", "webp"]);
  });

  test("svg, heic e arquivo que não é imagem são recusados ao colar: nada entra e nada quebra", async ({ page, request }) => {
    const { slug } = await setup(request, "Imagem Recusa");
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/#/${slug}`);
    await paste(page, [file("a.svg", "image/svg+xml"), file("a.heic", "image/heic"), file("a.txt", "text/plain")]);
    await expect(images(page)).toHaveCount(0);
    await page.keyboard.type("segue funcionando");
    await expect(editor(page)).toContainText("segue funcionando");
    expect(errors).toEqual([]);
  });

  test("o seletor de arquivo só lista os tipos aceitos", async ({ page, request }) => {
    const { slug } = await setup(request, "Imagem Accept");
    await page.goto(`/#/${slug}`);
    await expect(fileInput(page)).toHaveAttribute("accept", "image/png,image/jpeg,image/gif,image/webp");
  });

  test("arquivo que não é imagem pelo seletor: o servidor recusa e o Studio avisa", async ({ page, request }) => {
    const { slug } = await setup(request, "Imagem Seletor Recusa");
    await page.goto(`/#/${slug}`);
    await editor(page).click();
    await fileInput(page).setInputFiles(file("virus.exe", "application/octet-stream", Buffer.from("MZ")));
    await expect(page.getByText(/Formato de imagem não suportado/)).toBeVisible();
    await expect(images(page)).toHaveCount(0);
  });

  test("arrastar e soltar põe a imagem no ponto onde soltou", async ({ page, request }) => {
    const { slug } = await setup(request, "Imagem Soltar", [{ title: "Tela", body: "Primeiro.\n\nSegundo.\n\nTerceiro." }]);
    await page.goto(`/#/${slug}`);
    const second = await editor(page).getByText("Segundo.").boundingBox();
    if (!second) throw new Error("sem caixa");
    await drop(page, [file("solta.png", "image/png")], { x: second.x + 10, y: second.y + second.height / 2 });
    await expect(images(page)).toHaveCount(1);
    const order = await editor(page)
      .locator("p")
      .evaluateAll((ps) => ps.map((p) => (p.querySelector("img") ? "img" : p.textContent)));
    expect(order.indexOf("img")).toBeGreaterThan(0);
    expect(order.indexOf("img")).toBeLessThan(order.length - 1);
  });

  test("nome com acento e espaço vira nome seguro, a imagem abre e a descrição guarda o nome original", async ({ page, request }) => {
    const { slug } = await setup(request, "Imagem Nome");
    await page.goto(`/#/${slug}`);
    await editor(page).click();
    await fileInput(page).setInputFiles(file("Captura de tela ação.png", "image/png"));
    const img = editor(page).getByRole("img", { name: "Captura de tela ação" });
    await expect(img).toBeVisible();
    expect(await img.getAttribute("src")).toMatch(/\/assets\/[a-z0-9-]+\.png$/);
    expect(await loaded(page)).toBe(true);
  });

  test("a mesma imagem duas vezes gera dois arquivos e as duas aparecem", async ({ page, request }) => {
    const { slug } = await setup(request, "Imagem Repetida");
    await page.goto(`/#/${slug}`);
    await editor(page).click();
    for (let i = 0; i < 2; i++) await fileInput(page).setInputFiles(file("tela.png", "image/png"));
    await expect(images(page)).toHaveCount(2);
    const [a, b] = await srcs(page);
    expect(a).not.toBe(b);
    expect(await loaded(page)).toBe(true);
  });

  test("imagem de 15 MB entra; acima de 20 MB o Studio recusa com aviso", async ({ page, request }) => {
    const { slug } = await setup(request, "Imagem Grande");
    await page.goto(`/#/${slug}`);
    await editor(page).click();
    const pad = (mb: number) => Buffer.concat([PNG, Buffer.alloc(mb * 1024 * 1024)]);
    await fileInput(page).setInputFiles(file("grande.png", "image/png", pad(15)));
    await expect(images(page)).toHaveCount(1, { timeout: 15_000 });
    await fileInput(page).setInputFiles(file("enorme.png", "image/png", pad(21)));
    await expect(page.locator("[data-sonner-toast]")).toBeVisible({ timeout: 15_000 });
    await expect(images(page)).toHaveCount(1);
  });
});
