import { type APIRequestContext, expect, type Page, test } from "@playwright/test";

// Controles direto na tabela (T-073): "+" nas bordas e menu por linha e por coluna.
const MD = "| A | B |\n| --- | --- |\n| 1 | 2 |\n";

async function open(page: Page, request: APIRequestContext, title: string) {
  const manual = await (await request.post("/api/manuals", { data: { title } })).json();
  const created = await (await request.post(`/api/manuals/${manual.slug}/pages`, { data: { title: "Tabela", body: MD } })).json();
  await page.goto(`/#/${manual.slug}/${created.id}`);
  await expect(table(page)).toBeVisible();
  return { slug: manual.slug as string, id: created.id as string };
}

const editor = (page: Page) => page.getByRole("textbox", { name: "Conteúdo da página" });
const table = (page: Page) => editor(page).locator("table");
const saved = (page: Page) => expect(page.getByRole("status")).toContainText("Salvo às");
const cell = (page: Page, text: string) =>
  table(page)
    .locator("td, th")
    .filter({ hasText: new RegExp(`^${text}$`) });

test("adiciona e remove linha e coluna pelos controles da tabela e mantém depois de recarregar", async ({ page, request }) => {
  await open(page, request, "Tabela controles");
  await cell(page, "1").hover();

  await page.getByRole("button", { name: "Adicionar linha abaixo" }).click();
  await expect(table(page).locator("tr")).toHaveCount(3);
  await cell(page, "1").hover();
  await page.getByRole("button", { name: "Adicionar coluna à direita" }).click();
  await expect(table(page).locator("tr").first().locator("th")).toHaveCount(3);
  await saved(page);

  await page.reload();
  await expect(table(page).locator("tr")).toHaveCount(3);
  await expect(table(page).locator("tr").first().locator("th")).toHaveCount(3);

  await cell(page, "1").hover();
  await page.getByRole("button", { name: "Opções da linha" }).click();
  await page.getByRole("menuitem", { name: "Remover linha" }).click();
  await expect(table(page).locator("tr")).toHaveCount(2);

  await cell(page, "B").hover();
  await page.getByRole("button", { name: "Opções da coluna" }).click();
  await page.getByRole("menuitem", { name: "Remover coluna" }).click();
  await expect(table(page).locator("tr").first().locator("th")).toHaveCount(2);
  await saved(page);

  await page.reload();
  await expect(table(page).locator("tr")).toHaveCount(2);
  await expect(table(page).locator("tr").first().locator("th")).toHaveCount(2);
});

test("menus inserem acima e à esquerda, alternam o cabeçalho e removem a tabela inteira", async ({ page, request }) => {
  await open(page, request, "Tabela menus");
  await cell(page, "1").hover();
  await page.getByRole("button", { name: "Opções da linha" }).click();
  await page.getByRole("menuitem", { name: "Inserir linha acima" }).click();
  await expect(table(page).locator("tr")).toHaveCount(3);

  await cell(page, "1").hover();
  await page.getByRole("button", { name: "Opções da coluna" }).click();
  await page.getByRole("menuitem", { name: "Inserir coluna à esquerda" }).click();
  await expect(table(page).locator("tr").first().locator("th")).toHaveCount(3);

  await cell(page, "A").hover();
  await page.getByRole("button", { name: "Opções da linha" }).click();
  await page.getByRole("menuitem", { name: "Linha de cabeçalho" }).click();
  await expect(table(page).locator("th")).toHaveCount(0);

  await cell(page, "1").hover();
  await page.getByRole("button", { name: "Opções da coluna" }).click();
  await page.getByRole("menuitem", { name: "Remover tabela" }).click();
  await expect(table(page)).toHaveCount(0);
});

test("pelo teclado: a barra fixa tem o menu da tabela e o Tab anda entre as células", async ({ page, request }) => {
  await open(page, request, "Tabela teclado");
  await cell(page, "A").click();
  await page.keyboard.press("Tab");
  await page.keyboard.type("x");
  await expect(cell(page, "x")).toBeVisible();

  await page.getByRole("button", { name: "Opções da tabela" }).click();
  await page.getByRole("menuitem", { name: "Inserir linha abaixo" }).click();
  await expect(table(page).locator("tr")).toHaveCount(3);
});

test("em 375 px os controles ficam visíveis e dentro da tela", async ({ page, request }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await open(page, request, "Tabela estreita");
  await cell(page, "1").click();
  for (const name of ["Opções da coluna", "Opções da linha", "Adicionar coluna à direita", "Adicionar linha abaixo"]) {
    const box = await page.getByRole("button", { name }).boundingBox();
    expect(box, name).not.toBeNull();
    expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(375);
  }
});
