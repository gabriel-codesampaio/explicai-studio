import { expect, test } from "@playwright/test";

async function novoManual(request: import("@playwright/test").APIRequestContext, title: string) {
  const manual = await (await request.post("/api/manuals", { data: { title } })).json();
  const page = await (await request.post(`/api/manuals/${manual.slug}/pages`, { data: { title: "Início" } })).json();
  return { slug: manual.slug as string, id: page.id as string };
}

// T-530: a letra logo após o Enter do título (sem pausa) entra no corpo.
test("Enter no título e digitação sem pausa: a letra cai no corpo", async ({ page, request }) => {
  const { slug } = await novoManual(request, "Digitação rápida");
  const nova = await (await request.post(`/api/manuals/${slug}/pages`, { data: { title: "" } })).json();
  await page.goto(`/#/${slug}/${nova.id}`);
  const title = page.getByRole("textbox", { name: "Título da página" });
  await expect(title).toBeFocused();
  await title.pressSequentially("Entrar no sistema", { delay: 0 });
  // Sem await entre as teclas: os eventos saem em fila, sem folga para o foco chegar ao corpo.
  await Promise.all([page.keyboard.press("Enter"), page.keyboard.type("Abra o endereço", { delay: 0 })]);
  await expect(title).toHaveValue("Entrar no sistema");
  await expect(page.locator(".ProseMirror")).toContainText("Abra o endereço");
});

// T-528: Esc na busca devolve o foco a quem estava focado antes.
test("Esc na busca devolve o foco ao botão Buscar e ao ponto de edição", async ({ page, request }) => {
  const { slug, id } = await novoManual(request, "Foco da busca");
  await page.goto(`/#/${slug}/${id}`);
  const buscar = page.getByRole("button", { name: /Buscar página/ });
  await buscar.click();
  await expect(page.getByRole("combobox")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(buscar).toBeFocused();

  await page.locator(".ProseMirror").click();
  await page.keyboard.press("Control+p");
  await expect(page.getByRole("combobox")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".ProseMirror")).toBeFocused();
});

// T-537: dica Ctrl+P some em toque e o atalho segue valendo.
test("dica Ctrl+P: visível no desktop, escondida em toque", async ({ page, request, browser }) => {
  const { slug, id } = await novoManual(request, "Dica de atalho");
  await page.goto(`/#/${slug}/${id}`);
  await expect(page.locator("kbd", { hasText: "Ctrl+P" })).toBeVisible();

  const touch = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 700 } });
  const mobile = await touch.newPage();
  await mobile.goto(`http://localhost:${process.env.E2E_PORT ?? "4400"}/#/${slug}/${id}`);
  await mobile
    .getByRole("button", { name: /Mostrar as páginas/ })
    .first()
    .click();
  await expect(mobile.getByRole("button", { name: /Buscar página/ })).toBeVisible();
  await expect(mobile.getByRole("button", { name: /Buscar página/ }).locator("kbd")).toBeHidden();
  await touch.close();
});

// T-557: legenda do status na árvore. T-558: Ajustes em grupos sem quebra; Exportar com formato e Cancelar.
test("legenda de status, menu Ajustes sem quebra e diálogo Exportar padronizado", async ({ page, request }) => {
  const { slug, id } = await novoManual(request, "Acabamento");
  await page.goto(`/#/${slug}/${id}`);
  await expect(page.getByText("Em revisão").first()).toBeVisible();

  await page.getByRole("button", { name: "Ajustes" }).click();
  const menu = page.getByRole("menu");
  await expect(menu.getByRole("separator")).toHaveCount(2);
  const tema = menu.getByRole("menuitem", { name: /Tema do Studio/ });
  const h = await tema.evaluate((el) => el.getBoundingClientRect().height);
  expect(h).toBeLessThan(36); // uma linha
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Exportar manual" }).click();
  const dialog = page.getByRole("dialog", { name: "Exportar manual" });
  const primario = dialog.getByRole("button", { name: "Exportar HTML" });
  const cancelar = dialog.getByRole("button", { name: "Cancelar" });
  const [p, c] = await Promise.all([primario.boundingBox(), cancelar.boundingBox()]);
  expect(c?.x).toBeLessThan(p?.x ?? 0);
  const box = await dialog.boundingBox();
  expect((box?.x ?? 0) + (box?.width ?? 0) - ((p?.x ?? 0) + (p?.width ?? 0))).toBeLessThan(40); // primário à direita
  await dialog.getByText("Para imprimir ou mandar por e-mail.").click();
  await expect(dialog.getByRole("button", { name: "Exportar PDF" })).toBeVisible();
  await cancelar.click();
  await expect(dialog).toBeHidden();
});
