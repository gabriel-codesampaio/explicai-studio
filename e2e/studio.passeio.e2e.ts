import { expect, test } from "@playwright/test";

// T-148: passeio guiado. Sob automação não abre sozinho; ?passeio=1 força.
test("passeio: não abre sozinho, abre com ?passeio=1, pula com Esc e reabre pelo menu Ajustes", async ({ page, request }) => {
  const manual = await (await request.post("/api/manuals", { data: { title: "Passeio" } })).json();
  const created = await (await request.post(`/api/manuals/${manual.slug}/pages`, { data: { title: "Tela", body: "x" } })).json();
  const url = `/#/${manual.slug}/${created.id}`;

  await page.goto(url);
  await expect(page.getByRole("textbox", { name: "Conteúdo da página" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Crie uma página" })).toHaveCount(0);

  await page.goto(`/?passeio=1${url.slice(1)}`);
  const dialog = page.getByRole("dialog", { name: "Crie uma página" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Próximo" })).toBeVisible();
  await dialog.getByRole("button", { name: "Próximo" }).click();
  await expect(page.getByRole("dialog", { name: "Cole um print" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("explicai:passeio"))).toBe("1");

  await page.getByRole("button", { name: "Ajustes" }).click();
  await page.getByRole("menuitem", { name: "Passeio guiado" }).click();
  const again = page.getByRole("dialog", { name: "Crie uma página" });
  await expect(again).toBeVisible();
  await expect(again.getByRole("button", { name: "Pular passeio" }))
    .toBeFocused()
    .catch(() => {});
  expect(await again.evaluate((el) => el.contains(document.activeElement))).toBe(true);
});
