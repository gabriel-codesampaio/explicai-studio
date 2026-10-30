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
      for (const f of list)
        dt.items.add(new File([Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0))], f.name, { type: f.type }));
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
      for (const f of list)
        dt.items.add(new File([Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0))], f.name, { type: f.type }));
      const init = { dataTransfer: dt, bubbles: true, cancelable: true, clientX: at.x, clientY: at.y };
      el.dispatchEvent(new DragEvent("dragover", init));
      el.dispatchEvent(new DragEvent("drop", init));
    },
    { list: serial(files), at },
  );
}

const srcs = (page: Page) => images(page).evaluateAll((els) => els.map((e) => e.getAttribute("src")));
const loaded = (page: Page) =>
  images(page).evaluateAll((els) =>
    els.every((e) => (e as HTMLImageElement).complete && (e as HTMLImageElement).naturalWidth > 0),
  );

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

  test("nome com acento e espaço vira nome seguro, a imagem abre e a descrição guarda o nome original", async ({
    page,
    request,
  }) => {
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

/** Manual com uma página que já traz a imagem `tela.png` (enviada pela API), para os testes que não são de entrada. */
async function withImage(request: APIRequestContext, title: string, body = "Antes.\n\n![Tela](../assets/tela.png)\n\nDepois.") {
  const { slug, pages } = await setup(request, title, [{ title: "Tela de clientes", body }]);
  const up = await request.post(`/api/manuals/${slug}/assets?name=tela.png`, { data: PNG });
  expect((await up.json()).path).toBe("assets/tela.png");
  return { slug, id: pages[0]?.id as string };
}
const pageBody = async (request: APIRequestContext, slug: string, id: string) =>
  (await (await request.get(`/api/manuals/${slug}/pages/${id}`)).json()).body as string;
const openImage = async (page: Page) => {
  await images(page).first().click();
  return page.getByRole("textbox", { name: "Descrição da imagem" });
};
/** Seleciona a imagem pelo teclado (Shift+seta sobre ela), sem abrir o balão da descrição. */
const selectImageByKeyboard = async (page: Page) => {
  await editor(page).getByText("Antes.").click();
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Shift+ArrowRight");
};
const markDialog = (page: Page) => page.getByRole("dialog", { name: "Marcar imagem" });
const annotations = (request: APIRequestContext, slug: string) =>
  request.get(`/api/manuals/${slug}/annotations?asset=assets/tela.png`).then((r) => r.json());

test.describe("edição", () => {
  test("descrição (alt) vai para o Markdown e continua depois de recarregar", async ({ page, request }) => {
    const { slug, id } = await withImage(request, "Imagem Alt");
    await page.goto(`/#/${slug}/${id}`);
    await (await openImage(page)).fill("Tela de clientes com o botão Novo");
    await saved(page);
    expect(await pageBody(request, slug, id)).toContain("![Tela de clientes com o botão Novo](../assets/tela.png)");
    await page.reload();
    await expect(editor(page).getByRole("img", { name: "Tela de clientes com o botão Novo" })).toBeVisible();
  });

  test("Enter depois de enviar a imagem cria parágrafo e dá para continuar escrevendo", async ({ page, request }) => {
    const { slug, pages } = await setup(request, "Imagem Enter");
    await page.goto(`/#/${slug}`);
    await editor(page).click();
    await fileInput(page).setInputFiles(IMAGE);
    await expect(images(page)).toHaveCount(1);
    await page.keyboard.press("Enter");
    await page.keyboard.type("Depois da imagem.");
    await expect(editor(page).locator("p").last()).toHaveText("Depois da imagem.");
    await saved(page);
    expect(await pageBody(request, slug, pages[0]?.id as string)).toMatch(
      /!\[tela\]\(\.\.\/assets\/tela\.png\)\s+Depois da imagem\./,
    );
  });

  // T-070: o cursor às vezes fica antes da imagem (cerca de 1 em 5).
  test.fixme("Ctrl+End numa página que termina na imagem leva o cursor para depois dela", async ({ page, request }) => {
    const { slug, id } = await withImage(request, "Imagem Fim", "Texto.\n\n![Tela](../assets/tela.png)");
    await page.goto(`/#/${slug}/${id}`);
    await expect(images(page)).toHaveCount(1);
    await expect.poll(() => loaded(page)).toBe(true);
    await editor(page).getByText("Texto.").click();
    await page.keyboard.press("Control+End");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Fim.");
    await saved(page);
    expect(await pageBody(request, slug, id)).toMatch(/!\[Tela\]\(\.\.\/assets\/tela\.png\)\s+Fim\./);
  });

  test("imagem dentro de um passo continua dentro do passo ao salvar e recarregar", async ({ page, request }) => {
    const { slug, id } = await withImage(
      request,
      "Imagem Passo",
      "1. Abra a tela.\n\n   ![Tela](../assets/tela.png)\n\n2. Clique em Novo.",
    );
    await page.goto(`/#/${slug}/${id}`);
    await expect(editor(page).locator("ol li .node-image img")).toHaveCount(1);
    await editor(page).getByText("Clique em Novo.").click();
    await page.keyboard.press("End");
    await page.keyboard.type(" Pronto.");
    await saved(page);
    expect(await pageBody(request, slug, id)).toMatch(/1\. Abra a tela\.\n\n\s{3}!\[Tela\]\(\.\.\/assets\/tela\.png\)/);
    await page.reload();
    await expect(editor(page).locator("ol li .node-image img")).toHaveCount(1);
    await expect(editor(page).locator("ol li")).toHaveCount(2);
  });

  test("apagar a imagem com Backspace, desfazer e refazer", async ({ page, request }) => {
    const { slug, id } = await withImage(request, "Imagem Apagar");
    await page.goto(`/#/${slug}/${id}`);
    await selectImageByKeyboard(page);
    await page.keyboard.press("Backspace");
    await expect(images(page)).toHaveCount(0);
    await page.keyboard.press("Control+z");
    await expect(images(page)).toHaveCount(1);
    await page.keyboard.press("Control+Shift+z");
    await expect(images(page)).toHaveCount(0);
    await saved(page);
    expect(await pageBody(request, slug, id)).not.toContain("tela.png");
  });

  test("mover a imagem arrastando para o texto de baixo", async ({ page, request }) => {
    const { slug, id } = await withImage(request, "Imagem Mover");
    await page.goto(`/#/${slug}/${id}`);
    await editor(page)
      .locator(".node-image")
      .dragTo(editor(page).getByText("Depois."), { targetPosition: { x: 40, y: 20 } });
    await saved(page);
    const body = await pageBody(request, slug, id);
    expect(body.indexOf("![Tela]")).toBeGreaterThan(body.indexOf("Depoi"));
    await expect(images(page)).toHaveCount(1);
  });

  test("copiar a imagem e colar em outra página usa o mesmo arquivo", async ({ page, request, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const { slug, id } = await withImage(request, "Imagem Copiar");
    const outra = await (await request.post(`/api/manuals/${slug}/pages`, { data: { title: "Outra" } })).json();
    await page.goto(`/#/${slug}/${id}`);
    await selectImageByKeyboard(page);
    await page.keyboard.press("Control+c");
    await page.getByRole("navigation", { name: "Páginas do manual" }).getByRole("button", { name: "Outra", exact: true }).click();
    await expect(page.getByRole("textbox", { name: "Título da página" })).toHaveValue("Outra");
    await editor(page).click();
    await page.keyboard.press("Control+v");
    await expect(images(page)).toHaveCount(1);
    await saved(page);
    expect(await pageBody(request, slug, outra.id)).toContain("../assets/tela.png");
  });
});

test.describe("marcações", () => {
  test("cria marcador, destaque, seta e área clicável, apaga e desfaz; só o Salvar grava", async ({ page, request }) => {
    const { slug, id } = await withImage(request, "Imagem Marcas");
    await page.goto(`/#/${slug}/${id}`);
    await openImage(page);
    await page.getByRole("button", { name: "Marcar imagem" }).click();
    const dialog = markDialog(page);
    const box = await dialog.getByRole("img").boundingBox();
    if (!box) throw new Error("sem caixa");
    const at = (fx: number, fy: number) => [box.x + box.width * fx, box.y + box.height * fy] as const;
    const drag = async (a: readonly [number, number], b: readonly [number, number]) => {
      await page.mouse.move(...a);
      await page.mouse.down();
      await page.mouse.move(...b, { steps: 5 });
      await page.mouse.up();
    };

    await dialog.getByRole("button", { name: "Marcador" }).click();
    await page.mouse.click(...at(0.15, 0.15));
    await dialog.getByRole("textbox", { name: "O que o marcador 1 mostra" }).fill("Botão Novo");
    await dialog.getByRole("button", { name: "Destaque" }).click();
    await drag(at(0.3, 0.3), at(0.5, 0.45));
    await dialog.getByRole("button", { name: "Seta" }).click();
    await drag(at(0.6, 0.6), at(0.8, 0.8));
    await dialog.getByRole("button", { name: "Área clicável" }).click();
    await drag(at(0.1, 0.6), at(0.3, 0.8));
    await expect(dialog.getByRole("button", { name: "Excluir destaque 1" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Excluir seta 1" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Excluir área 1" })).toBeVisible();

    // Excluir o destaque pela lista e trazer de volta com Desfazer.
    await dialog.getByRole("button", { name: "Excluir destaque 1" }).click();
    await expect(dialog.getByRole("button", { name: "Excluir destaque 1" })).toHaveCount(0);
    await dialog.getByRole("button", { name: "Desfazer" }).click();
    await expect(dialog.getByRole("button", { name: "Excluir destaque 1" })).toBeVisible();

    // Selecionar o marcador e apagar com Delete.
    await dialog.getByRole("button", { name: "Selecionar" }).click();
    await page.mouse.click(...at(0.15, 0.15));
    await page.keyboard.press("Delete");
    await expect(dialog.getByRole("textbox", { name: "O que o marcador 1 mostra" })).toHaveCount(0);
    await dialog.getByRole("button", { name: "Desfazer" }).click();
    await expect(dialog.getByRole("textbox", { name: "O que o marcador 1 mostra" })).toHaveValue("Botão Novo");

    // Nada foi gravado ainda.
    expect((await annotations(request, slug)).markers).toEqual([]);
    await dialog.getByRole("button", { name: "Salvar marcações" }).click();
    await expect(dialog).toBeHidden();
    const a = await annotations(request, slug);
    expect([a.markers.length, a.highlights.length, a.arrows.length, a.hotspots.length]).toEqual([1, 1, 1, 1]);
    expect(a.markers[0].label).toBe("Botão Novo");
  });

  test("Cancelar descarta o que foi marcado", async ({ page, request }) => {
    const { slug, id } = await withImage(request, "Imagem Cancelar");
    await page.goto(`/#/${slug}/${id}`);
    await openImage(page);
    await page.getByRole("button", { name: "Marcar imagem" }).click();
    await markDialog(page)
      .getByRole("img")
      .click({ position: { x: 40, y: 40 } });
    await expect(markDialog(page).getByRole("textbox", { name: "O que o marcador 1 mostra" })).toBeVisible();
    await markDialog(page).getByRole("button", { name: "Cancelar" }).click();
    await expect(markDialog(page)).toBeHidden();
    expect((await annotations(request, slug)).markers).toEqual([]);
  });

  test("a legenda aparece na página e continua depois de recarregar", async ({ page, request }) => {
    const { slug, id } = await withImage(request, "Imagem Legenda");
    await request.put(`/api/manuals/${slug}/annotations?asset=assets/tela.png`, {
      data: {
        version: 1,
        markers: [{ id: "m1", n: 1, x: 0.3, y: 0.3, label: "Menu Clientes" }],
        highlights: [],
        arrows: [],
        hotspots: [],
      },
    });
    await page.goto(`/#/${slug}/${id}`);
    await expect(page.getByRole("list", { name: "Legenda da imagem" })).toContainText("Menu Clientes");
    await page.reload();
    await expect(page.getByRole("list", { name: "Legenda da imagem" })).toContainText("Menu Clientes");
  });
});

const unused = async (request: APIRequestContext, slug: string) =>
  (await (await request.get(`/api/manuals/${slug}/assets/unused`)).json()).count as number;
const fileStatus = async (request: APIRequestContext, slug: string, asset: string) =>
  (await request.get(`/files/${slug}/${asset}`)).status();
const exportApi = async (request: APIRequestContext, slug: string, format: string) =>
  (await (await request.post(`/api/manuals/${slug}/export`, { data: { format } })).json()) as {
    file: string;
    url: string;
    warnings: string[];
  };
const marks = {
  version: 1,
  markers: [{ id: "m1", n: 1, x: 0.3, y: 0.3, label: "Menu Clientes" }],
  highlights: [{ id: "h1", x: 0.1, y: 0.1, w: 0.2, h: 0.2 }],
  arrows: [],
  hotspots: [],
};

test.describe("persistência", () => {
  test("versão guardada e restaurada mantém a imagem e as marcações", async ({ page, request }) => {
    const { slug, id } = await withImage(request, "Imagem Versao");
    await request.put(`/api/manuals/${slug}/annotations?asset=assets/tela.png`, { data: marks });
    const v = await (await request.post(`/api/manuals/${slug}/pages/${id}/versions`, { data: { note: "com imagem" } })).json();
    await request.put(`/api/manuals/${slug}/pages/${id}`, { data: { body: "Só texto." } });
    await request.post(`/api/manuals/${slug}/pages/${id}/versions/${v.id}/restore`);
    await page.goto(`/#/${slug}/${id}`);
    await expect(images(page)).toHaveCount(1);
    expect(await loaded(page)).toBe(true);
    await expect(page.getByRole("list", { name: "Legenda da imagem" })).toContainText("Menu Clientes");
  });

  test("página na lixeira mantém a imagem fora da limpeza e restaurar traz a imagem de volta", async ({ page, request }) => {
    const { slug, id } = await withImage(request, "Imagem Lixeira");
    expect(await unused(request, slug)).toBe(0);
    const trash = await (await request.delete(`/api/manuals/${slug}/pages/${id}`)).json();
    expect(await unused(request, slug)).toBe(0);
    expect(await fileStatus(request, slug, "assets/tela.png")).toBe(200);
    await request.post(`/api/manuals/${slug}/trash/${trash.trashId ?? trash.id}/restore`);
    await page.goto(`/#/${slug}/${id}`);
    await expect(images(page)).toHaveCount(1);
    expect(await loaded(page)).toBe(true);
  });

  test("renomear a página não quebra a imagem", async ({ page, request }) => {
    const { slug, id } = await withImage(request, "Imagem Renomear");
    await request.put(`/api/manuals/${slug}/pages/${id}`, { data: { title: "Outro nome" } });
    await page.goto(`/#/${slug}/${id}`);
    await expect(page.getByRole("textbox", { name: "Título da página" })).toHaveValue("Outro nome");
    await expect(images(page)).toHaveCount(1);
    expect(await loaded(page)).toBe(true);
  });

  test("imagem sem uso é contada e a limpeza move para a lixeira sem tocar nas usadas", async ({ request }) => {
    const { slug } = await withImage(request, "Imagem Sem Uso");
    await request.post(`/api/manuals/${slug}/assets?name=solta.png`, { data: PNG });
    expect(await unused(request, slug)).toBe(1);
    await request.post(`/api/manuals/${slug}/assets/clean`);
    expect(await unused(request, slug)).toBe(0);
    expect(await fileStatus(request, slug, "assets/solta.png")).toBe(404);
    expect(await fileStatus(request, slug, "assets/tela.png")).toBe(200);
  });
});

test.describe("exportação com imagem", () => {
  test("HTML e Markdown levam a imagem e as marcações; o PDF sai", async ({ request }) => {
    const { slug } = await withImage(request, "Imagem Exporta");
    await request.put(`/api/manuals/${slug}/annotations?asset=assets/tela.png`, { data: marks });
    const html = await exportApi(request, slug, "html");
    const htmlText = await (await request.get(html.url)).text();
    expect(htmlText).toContain("Menu Clientes");
    expect(htmlText).toContain('src="assets/tela.png"');
    expect((await request.get(html.url.replace("index.html", "assets/tela.png"))).status()).toBe(200);
    const md = await exportApi(request, slug, "markdown");
    expect(await (await request.get(md.url)).text()).toMatch(/!\[Tela\]\(assets\/tela\.png\)[\s\S]*1\. Menu Clientes/);
    const pdf = await request.post(`/api/manuals/${slug}/export`, { data: { format: "pdf" } });
    expect(pdf.status()).toBe(200);
    const pdfFile = await (await request.get((await pdf.json()).url)).body();
    expect(pdfFile.subarray(0, 4).toString()).toBe("%PDF");
  });

  test("imagem que sumiu: o diálogo de exportação mostra o aviso com o nome do arquivo", async ({ page, request }) => {
    const { slug } = await setup(request, "Imagem Sumiu", [{ title: "Tela", body: "![Sumiu](../assets/sumiu.png)" }]);
    await page.goto(`/#/${slug}`);
    await page.getByRole("button", { name: "Exportar manual" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByText("Site (HTML)", { exact: true }).click();
    await dialog.getByRole("button", { name: "Exportar", exact: true }).click();
    await expect(dialog.getByText(/Atenção: 1 aviso/)).toBeVisible();
    await expect(dialog).toContainText("assets/sumiu.png");
  });
});

test.describe("robustez do envio", () => {
  test("rede cai no envio: avisa, nada entra, o texto segue e o segundo envio funciona", async ({ page, request }) => {
    const { slug } = await setup(request, "Imagem Rede");
    await page.route("**/assets?*", (route) => route.abort("failed"));
    await page.goto(`/#/${slug}`);
    await editor(page).click();
    await fileInput(page).setInputFiles(IMAGE);
    await expect(page.getByText("Não foi possível falar com o Studio")).toBeVisible();
    await expect(images(page)).toHaveCount(0);
    await page.keyboard.type("texto continua");
    await page.unroute("**/assets?*");
    await fileInput(page).setInputFiles(IMAGE);
    await expect(images(page)).toHaveCount(1);
    await expect(editor(page)).toContainText("texto continua");
  });

  test("servidor responde 500 no envio: mostra a mensagem do servidor e a página segue editável", async ({ page, request }) => {
    const { slug } = await setup(request, "Imagem 500");
    await page.route("**/assets?*", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Disco cheio simulado." }) }),
    );
    await page.goto(`/#/${slug}`);
    await editor(page).click();
    await fileInput(page).setInputFiles(IMAGE);
    await expect(page.getByText("Disco cheio simulado.")).toBeVisible();
    await expect(images(page)).toHaveCount(0);
    await page.keyboard.type("ainda edita");
    await expect(editor(page)).toContainText("ainda edita");
  });

  test("envio lento: dá para escrever enquanto sobe, e a imagem entra no fim", async ({ page, request }) => {
    const { slug } = await setup(request, "Imagem Lenta");
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => {
      release = r;
    });
    await page.route("**/assets?*", async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto(`/#/${slug}`);
    await editor(page).click();
    await fileInput(page).setInputFiles(IMAGE);
    await page.keyboard.type("escrevendo enquanto sobe");
    await expect(editor(page)).toContainText("escrevendo enquanto sobe");
    await expect(images(page)).toHaveCount(0);
    release();
    await expect(images(page)).toHaveCount(1);
    await expect(editor(page)).toContainText("escrevendo enquanto sobe");
  });

  test("duas abas enviando a mesma imagem ficam com arquivos diferentes", async ({ page, context, request }) => {
    const { slug, pages } = await setup(request, "Imagem Duas Abas", [{ title: "A" }, { title: "B" }]);
    const outra = await context.newPage();
    await page.goto(`/#/${slug}/${pages[0]?.id}`);
    await outra.goto(`/#/${slug}/${pages[1]?.id}`);
    await editor(page).click();
    await editor(outra).click();
    await fileInput(page).setInputFiles(IMAGE);
    await expect(images(page)).toHaveCount(1);
    await outra.bringToFront();
    await fileInput(outra).setInputFiles(IMAGE);
    await expect(images(page)).toHaveCount(1);
    await expect(images(outra)).toHaveCount(1);
    expect(await srcs(page)).not.toEqual(await srcs(outra));
    expect(await loaded(page)).toBe(true);
    expect(await loaded(outra)).toBe(true);
  });
});

for (const width of [375, 1280]) {
  for (const mode of ["light", "dark"]) {
    test(`tela em ${width} px, tema ${mode}: sem rolagem lateral, imagem cabe e sem violação grave de acessibilidade`, async ({
      page,
      request,
    }) => {
      const { slug, id } = await withImage(request, `Imagem Tela ${width} ${mode}`);
      await request.put(`/api/manuals/${slug}/annotations?asset=assets/tela.png`, { data: marks });
      await page.setViewportSize({ width, height: 800 });
      await page.addInitScript((m) => localStorage.setItem("explicai:aparencia", JSON.stringify({ mode: m })), mode);
      await page.goto(`/#/${slug}/${id}`);
      await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
      await expect(images(page)).toHaveCount(1);
      expect(await loaded(page)).toBe(true);
      const m = await page.evaluate(() => {
        const img = document.querySelector(".node-image img") as HTMLImageElement;
        return {
          scroll: document.documentElement.scrollWidth - window.innerWidth,
          right: img.getBoundingClientRect().right,
          vw: window.innerWidth,
        };
      });
      expect(m.scroll).toBeLessThanOrEqual(0);
      expect(m.right).toBeLessThanOrEqual(m.vw);
      await expect(editor(page).getByRole("img", { name: "Tela" })).toBeVisible();
      const axe = await new AxeBuilder({ page }).analyze();
      const grave = axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(grave.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    });
  }
}

// T-071: Esc fecha o balão mas o foco cai no body.
test.fixme("teclado: o balão da descrição abre ao selecionar a imagem, o Tab chega em Marcar imagem e o Esc devolve o foco ao editor", async ({
  page,
  request,
}) => {
  const { slug, id } = await withImage(request, "Imagem Teclado");
  await page.goto(`/#/${slug}/${id}`);
  const alt = await openImage(page);
  await expect(alt).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Marcar imagem" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(alt).toBeHidden();
  await expect(editor(page)).toBeFocused();
});
