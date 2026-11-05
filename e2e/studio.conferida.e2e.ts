import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// T-545: marcar a página como conferida, ver a data e filtrar a árvore pelas não conferidas.
test("conferida: marcar grava a data de hoje, rótulo aparece e o filtro esconde a página em dia", async ({ page, request }) => {
  const m = await (await request.post("/api/manuals", { data: { title: "Conferência", language: "pt-BR" } })).json();
  const a = await (await request.post(`/api/manuals/${m.slug}/pages`, { data: { title: "Página A", body: "Texto." } })).json();
  await request.post(`/api/manuals/${m.slug}/pages`, { data: { title: "Página B", body: "Texto." } });
  await page.goto(`/#/${m.slug}/${a.id}`);

  await expect(page.getByTestId("reviewed-label")).toHaveText("Nunca conferida");
  await page.getByRole("button", { name: "Marcar como conferida" }).click();
  await expect(page.getByTestId("reviewed-label")).toContainText("Conferida em");
  const saved = await (await request.get(`/api/manuals/${m.slug}/pages/${a.id}`)).json();
  expect(saved.reviewed).toBe(new Date().toLocaleDateString("sv"));

  const tree = page.getByRole("navigation", { name: "Páginas do manual" });
  const filter = tree.getByRole("button", { name: "Só não conferidas" });
  await filter.click();
  await expect(filter).toHaveAttribute("aria-pressed", "true");
  await expect(tree.getByText("Página B")).toBeVisible();
  await expect(tree.getByText("Página A")).toHaveCount(0);
  expect((await new AxeBuilder({ page }).include("nav").analyze()).violations).toEqual([]);

  await filter.click();
  await expect(tree.getByText("Página A")).toBeVisible();
});
