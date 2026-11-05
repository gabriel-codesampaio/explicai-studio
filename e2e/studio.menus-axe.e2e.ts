import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// T-173 (fundo aria-hidden dos menus Radix sem foco), T-263 (busca e menu "/").
test("menus abertos: axe sem aria-hidden-focus e Tab não sai do menu", async ({ page, request }) => {
  const m = await (await request.post("/api/manuals", { data: { title: "Menus", language: "pt-BR" } })).json();
  const p = await (await request.post(`/api/manuals/${m.slug}/pages`, { data: { title: "Início" } })).json();
  await page.goto(`/#/${m.slug}/${p.id}`);
  const abrir = [
    () => page.getByRole("button", { name: "Ajustes" }).click(),
    () => page.getByRole("button", { name: /Status da página/ }).click(),
    () => page.getByRole("button", { name: /Mais ações para/ }).first().click({ force: true }),
  ];
  for (const open of abrir) {
    await open();
    await expect(page.getByRole("menu")).toBeVisible();
    const r = await new AxeBuilder({ page }).withRules(["aria-hidden-focus"]).analyze();
    expect(r.violations).toEqual([]);
    for (const key of ["Tab", "Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab"]) {
      await page.keyboard.press(key);
      expect(await page.evaluate(() => !!document.activeElement?.closest("[role=menu]"))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toBeHidden();
  }
});

test("busca (Ctrl+P) e menu / sem violação do axe, vazios e com resultado", async ({ page, request }) => {
  const m = await (await request.post("/api/manuals", { data: { title: "Busca", language: "pt-BR" } })).json();
  const p = await (await request.post(`/api/manuals/${m.slug}/pages`, { data: { title: "Configurar acesso" } })).json();
  await page.goto(`/#/${m.slug}/${p.id}`);
  const editor = page.getByRole("textbox", { name: "Conteúdo da página" });
  await expect(editor).toBeVisible();
  // Com o diálogo aberto o <main> fica inert (fundo); o axe estranha a rolagem dele sem foco, o que não vale para o fundo.
  const clean = async (fundo = false) => {
    const axe = new AxeBuilder({ page });
    expect((await (fundo ? axe.exclude("#conteudo") : axe).analyze()).violations).toEqual([]);
  };

  await page.keyboard.press("Control+p");
  await expect(page.getByRole("dialog")).toBeVisible();
  await clean(true);
  await page.keyboard.type("conf");
  await expect(page.getByRole("option")).toHaveCount(1);
  await clean(true);
  await page.keyboard.press("Control+a");
  await page.keyboard.type("zzzzqq");
  await expect(page.getByRole("option")).toHaveCount(0);
  await clean(true);
  await page.keyboard.press("Escape");

  await editor.click();
  await page.keyboard.type("/");
  await expect(page.getByRole("listbox")).toBeVisible();
  await clean();
  await page.keyboard.type("zzzzqq");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await clean();
});
