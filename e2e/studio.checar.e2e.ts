import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// T-540: "Checar manual" pelo menu do manual, contagem no Exportar e clique que abre a página.
test("checar manual: achados por página, teclado, axe, clique abre a página e contagem no Exportar", async ({
  page,
  request,
}) => {
  const m = await (await request.post("/api/manuals", { data: { title: "Checagem", language: "pt-BR" } })).json();
  const bad = await (
    await request.post(`/api/manuals/${m.slug}/pages`, {
      data: { title: "Página ruim", body: "1. Clique em A.\n\nA confirmar." },
    })
  ).json();
  const good = await (
    await request.post(`/api/manuals/${m.slug}/pages`, { data: { title: "Página boa", body: "Só texto." } })
  ).json();
  await page.goto(`/#/${m.slug}/${good.id}`);

  // Contagem no botão: o nome continua "Exportar manual"; o número vai na descrição.
  const exportBtn = page.getByRole("button", { name: "Exportar manual", exact: true });
  await expect(exportBtn).toHaveAccessibleDescription("3 achados na checagem do manual.");

  await page.getByRole("button", { name: /Checagem/ }).click();
  await page.getByRole("menuitem", { name: "Checar manual" }).click();
  const dialog = page.getByRole("dialog", { name: "Checar manual" });
  await expect(dialog.getByRole("heading", { name: "Página ruim" })).toBeVisible();
  await expect(dialog.getByText("A confirmar", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Passo sem resultado")).toBeVisible();
  await expect(dialog.getByRole("alert")).toHaveCount(0); // "A confirmar" não é erro
  // axe no meio do fade de abertura lê cor misturada e acusa contraste falso
  await dialog.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)));
  expect((await new AxeBuilder({ page }).include("[role=dialog]").analyze()).violations).toEqual([]);

  // Só teclado: o foco fica preso no diálogo e Esc devolve ao seletor do manual.
  for (const key of ["Tab", "Tab", "Tab", "Tab", "Tab", "Tab", "Tab"]) {
    await page.keyboard.press(key);
    expect(await page.evaluate(() => !!document.activeElement?.closest("[role=dialog]"))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: /Checagem/ })).toBeFocused();

  // T-570: o Exportar explica o número, lista os achados e abre a página.
  await expect(exportBtn).toHaveAttribute("title", "3 achados na checagem do manual.");
  await exportBtn.click();
  const exp = page.getByRole("dialog", { name: "Exportar manual" });
  await expect(exp.getByRole("heading", { name: /Checagem do manual · 3 achados/ })).toBeVisible();
  await expect(exp.getByText(/não impedem de exportar/)).toBeVisible();
  // axe no meio do fade de abertura lê cor misturada e acusa contraste falso
  await exp.evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)));
  expect((await new AxeBuilder({ page }).include("[role=dialog]").analyze()).violations).toEqual([]);
  await exp
    .getByRole("button", { name: /Abrir página Página ruim/ })
    .first()
    .click();
  await expect(exp).toBeHidden();
  await expect.poll(() => new URL(page.url()).hash).toBe(`#/${m.slug}/${bad.id}`);
  await page.goto(`/#/${m.slug}/${good.id}`);

  await page.getByRole("button", { name: /Checagem/ }).click();
  await page.getByRole("menuitem", { name: "Checar manual" }).click();
  await dialog.getByRole("button", { name: /Passo sem resultado/ }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => new URL(page.url()).hash).toBe(`#/${m.slug}/${bad.id}`);
});

test("checar manual: sem achado mostra o estado vazio e o Exportar fica sem número", async ({ page, request }) => {
  const m = await (await request.post("/api/manuals", { data: { title: "Limpo", language: "pt-BR" } })).json();
  const p = await (await request.post(`/api/manuals/${m.slug}/pages`, { data: { title: "Início", body: "Texto." } })).json();
  await page.goto(`/#/${m.slug}/${p.id}`);
  await page.getByRole("button", { name: /Limpo/ }).click();
  await page.getByRole("menuitem", { name: "Checar manual" }).click();
  await expect(page.getByRole("dialog", { name: "Checar manual" }).getByText("Nenhum problema encontrado.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Exportar manual", exact: true })).not.toHaveAccessibleDescription(/achado/);
  await page.getByRole("button", { name: "Exportar manual", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Exportar manual" }).getByText("Nenhum achado.")).toBeVisible();
});
