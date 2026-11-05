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
