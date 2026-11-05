import { type APIRequestContext, expect, type Page, test } from "@playwright/test";
import { settleEditor } from "./editor-sync.js";

// Marca-texto no editor (T-145): botão, <mark> e ==texto== no arquivo.
const editor = (page: Page) => page.getByRole("textbox", { name: "Conteúdo da página" });
const toolbar = (page: Page) => page.getByRole("toolbar", { name: "Formatação" });

test("marca-texto: botão aplica <mark>, salva ==alvo== e mantém ao recarregar", async ({
  page,
  request,
}: {
  page: Page;
  request: APIRequestContext;
}) => {
  const manual = await (await request.post("/api/manuals", { data: { title: "Marca texto" } })).json();
  const created = await (await request.post(`/api/manuals/${manual.slug}/pages`, { data: { title: "P", body: "" } })).json();
  await page.goto(`/#/${manual.slug}/${created.id}`);
  await editor(page).click();
  await page.keyboard.type("veja alvo");
  await settleEditor(page);
  const box = await editor(page)
    .getByText("veja alvo")
    .evaluate((el) => {
      const n = el.firstChild as Text;
      const r = document.createRange();
      r.setStart(n, 5);
      r.setEnd(n, 9);
      const { x, y, width, height } = r.getBoundingClientRect();
      return { x: x + width / 2, y: y + height / 2 };
    });
  await page.mouse.dblclick(box.x, box.y);
  await expect.poll(() => page.evaluate(() => getSelection()?.toString())).toBe("alvo");
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

  const btn = toolbar(page).getByRole("button", { name: "Marca-texto" });
  await expect(btn).toHaveAttribute("aria-pressed", "false");
  await btn.click();
  await expect(btn).toHaveAttribute("aria-pressed", "true");
  await expect(editor(page).locator("mark")).toHaveText("alvo");
  await expect(page.getByRole("status").filter({ hasText: "Salvo às" })).toBeVisible();

  const body = ((await (await request.get(`/api/manuals/${manual.slug}/pages/${created.id}`)).json()) as { body: string }).body;
  expect(body).toContain("veja ==alvo==");

  await page.reload();
  await expect(editor(page).locator("mark")).toHaveText("alvo");
});
