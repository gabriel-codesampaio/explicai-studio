import { expect, test } from "@playwright/test";

// T-143: renomear muda só o título; pasta, slug e endereço da página ficam iguais.
test("renomear o manual pelo seletor troca o título na hora e mantém endereço e pasta", async ({ page, request }) => {
  const manual = await (await request.post("/api/manuals", { data: { title: "Antes do nome" } })).json();
  const created = await (await request.post(`/api/manuals/${manual.slug}/pages`, { data: { title: "Início" } })).json();
  await page.goto(`/#/${manual.slug}/${created.id}`);
  const trigger = page.getByRole("button", { name: /Antes do nome/ });
  await trigger.click();
  await page.getByRole("menuitem", { name: "Renomear manual" }).click();

  const dialog = page.getByRole("dialog", { name: "Renomear manual" });
  const field = dialog.getByLabel("Nome do manual");
  await expect(field).toBeFocused();
  await field.fill("   ");
  await field.press("Enter");
  await expect(dialog.getByRole("alert")).toHaveText("Dê um nome ao manual.");
  await field.fill("Nome novo");
  await field.press("Enter");
  await expect(dialog).toBeHidden();

  await expect(page.getByRole("button", { name: /Nome novo/ })).toBeFocused();
  await expect(page.getByText("Antes do nome")).toHaveCount(0); // sidebar e topo já mostram o novo
  expect(new URL(page.url()).hash).toBe(`#/${manual.slug}/${created.id}`);
  const detail = await (await request.get(`/api/manuals/${manual.slug}`)).json();
  expect(detail).toMatchObject({ slug: manual.slug, title: "Nome novo" });
  expect(detail.pages[0].id).toBe(created.id);
});
