import { expect, type Page, test } from "@playwright/test";

async function abrir(page: Page, request: import("@playwright/test").APIRequestContext) {
  const manual = await (await request.post("/api/manuals", { data: { title: "Aparência" } })).json();
  await page.goto(`/#/${manual.slug}`);
  await page.getByRole("button", { name: "Ajustes" }).click();
  await page.getByRole("menuitem", { name: "Aparência do manual" }).click();
  const dialog = page.getByRole("dialog", { name: "Aparência do manual" });
  await expect(dialog).toBeVisible();
  return { slug: manual.slug as string, dialog };
}

// T-565: a amostra fica à vista enquanto a coluna da esquerda rola.
for (const height of [800, 600]) {
  test(`amostra da Aparência fica inteira na tela depois de rolar (1280x${height})`, async ({ page, request }) => {
    await page.setViewportSize({ width: 1280, height });
    const { dialog } = await abrir(page, request);
    const sample = dialog.getByTestId("amostra-manual");
    await dialog.getByRole("checkbox", { name: /Sem o rodapé do Explicaí/ }).scrollIntoViewIfNeeded();
    await dialog.locator(".overflow-y-auto").evaluate((el) => el.scrollTo(0, el.scrollHeight));
    const box = await sample.boundingBox();
    expect(box?.y).toBeGreaterThanOrEqual(0);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(height);
  });
}

// T-566: uma cor para os cinco títulos; "Ajustar por nível" abre os cinco campos.
test("Cor dos títulos grava os cinco níveis e Ajustar por nível mostra cada um", async ({ page, request }) => {
  const { slug, dialog } = await abrir(page, request);
  await expect(dialog.getByLabel("Título 1", { exact: true })).toHaveCount(0);
  const hex = dialog.getByLabel("Cor dos títulos: código da cor");
  await expect(hex).toHaveValue("#151a33");
  await hex.fill("#7a3fc4");
  await hex.press("Enter");
  await expect
    .poll(async () => (await (await request.get(`/api/manuals/${slug}`)).json()).theme.headings)
    .toEqual({ cover: "#7a3fc4", page: "#7a3fc4", h1: "#7a3fc4", h2: "#7a3fc4", h3: "#7a3fc4" });
  await dialog.getByRole("button", { name: "Ajustar por nível" }).click();
  for (const nome of ["Título da capa", "Título da página", "Título 1", "Título 2", "Título 3"])
    await expect(dialog.getByLabel(nome, { exact: true })).toHaveValue("#7a3fc4");
});

// T-567: o erro de contraste não empurra os campos de baixo.
test("erro de contraste na cor não muda a posição de 'Cor de realce'", async ({ page, request }) => {
  const { dialog } = await abrir(page, request);
  const realce = dialog.getByLabel("Cor de realce", { exact: true });
  // espera a animação de abertura acabar: medir no meio dela dá posição fracionada
  await dialog.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)));
  const antes = (await realce.boundingBox())?.y;
  const hex = dialog.getByLabel("Cor do texto: código da cor");
  await hex.fill("#eeeeee");
  await hex.press("Enter");
  await expect(dialog.getByRole("alert")).toContainText("o mínimo é 4,5:1");
  expect((await realce.boundingBox())?.y).toBeCloseTo(antes ?? 0, 1);
  await hex.fill("#222222");
  await expect(dialog.getByRole("alert")).toHaveCount(0);
  expect((await realce.boundingBox())?.y).toBeCloseTo(antes ?? 0, 1);
});
