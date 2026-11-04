import { expect, test } from "@playwright/test";

// Página vazia que ensina o primeiro print (T-018), rodapé opcional (T-033) e corretor (T-036).
test("página vazia ensina o primeiro passo, leva ao Exportar e some com texto", async ({ page, request }) => {
  const manual = await (await request.post("/api/manuals", { data: { title: "Lote seis", language: "en-US" } })).json();
  const created = await (await request.post(`/api/manuals/${manual.slug}/pages`, { data: { title: "Vazia" } })).json();
  await page.goto(`/#/${manual.slug}/${created.id}`);
  const editor = page.getByRole("textbox", { name: "Conteúdo da página" });
  await expect(editor).toHaveAttribute("spellcheck", "true");
  await expect(editor).toHaveAttribute("lang", "en-US");

  const hint = page.getByRole("region", { name: "Comece pelo primeiro print" });
  await expect(hint).toContainText("Ctrl+V");
  await hint.getByRole("button", { name: "Abrir a exportação" }).click();
  const dialog = page.getByRole("dialog", { name: "Exportar manual" });
  await expect(dialog).toBeVisible();

  const rodape = dialog.getByRole("checkbox", { name: /Sem o rodapé do Explicaí/ });
  await rodape.click();
  await expect.poll(async () => (await (await request.get(`/api/manuals/${manual.slug}`)).json()).theme.hideColophon).toBe(true);
  await expect(rodape).toBeChecked();
  await rodape.click();
  await expect
    .poll(async () => (await (await request.get(`/api/manuals/${manual.slug}`)).json()).theme.hideColophon)
    .toBeUndefined();
  await page.keyboard.press("Escape");

  await editor.click();
  await page.keyboard.type("Texto");
  await expect(hint).toBeHidden();
});
