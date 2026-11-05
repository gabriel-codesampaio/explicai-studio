import AxeBuilder from "@axe-core/playwright";
import { type APIRequestContext, expect, type Page, test } from "@playwright/test";

/** Manual com uma página de corpo `body`, uma versão guardada com esse corpo e o texto atual trocado por `current`. */
async function seed(request: APIRequestContext, title: string, body: string, current: string) {
  const manual = await (await request.post("/api/manuals", { data: { title } })).json();
  const slug = manual.slug as string;
  const url = `/api/manuals/${slug}/pages`;
  const created = await (await request.post(url, { data: { title: "Cadastro", body } })).json();
  await request.post(`${url}/${created.id}/versions`, { data: { note: "Aprovada" } });
  const put = await request.put(`${url}/${created.id}`, { data: { body: current } });
  expect(put.ok()).toBe(true);
  return `/#/${slug}/${created.id}`;
}

async function openCompare(page: Page, hash: string) {
  await page.goto(hash);
  await page.getByRole("button", { name: /^Versões/ }).click();
  const dialog = page.getByRole("dialog", { name: "Versões desta página" });
  await dialog.getByRole("button", { name: "Comparar com o atual" }).click();
  return dialog;
}

// Com o diálogo aberto o fundo fica inerte: se a página rolar, o main não tem nada focável (regra de página, não do diálogo).
const grave = async (page: Page) =>
  (await new AxeBuilder({ page }).disableRules(["scrollable-region-focusable"]).analyze()).violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes[0]?.target}`);

test("comparar: mostra removida e adicionada nos dois painéis, sem restaurar, e devolve o foco", async ({ page, request }) => {
  const hash = await seed(request, "Manual Comparar", "um\ndois\ntres", "um\nDOIS\ntres\nquatro");
  const dialog = await openCompare(page, hash);

  const saved = dialog.getByRole("region", { name: "Versão guardada: Aprovada" });
  const current = dialog.getByRole("region", { name: "Texto atual da página" });
  await expect(saved).toContainText("Removida: dois");
  await expect(saved).not.toContainText("DOIS");
  await expect(current).toContainText("Adicionada: DOIS");
  await expect(current).toContainText("Adicionada: quatro");
  await expect(saved).toHaveAttribute("tabindex", "0");
  expect(await grave(page)).toEqual([]);

  // Teclado: Tab chega aos painéis; Voltar devolve o foco ao botão Comparar da mesma linha.
  await saved.focus();
  await expect(saved).toBeFocused();
  await dialog.getByRole("button", { name: "Voltar à lista" }).click();
  await expect(dialog.getByRole("button", { name: "Comparar com o atual" })).toBeFocused();

  // Nada foi restaurado: o texto atual continua o editado e não surgiu "Antes de restaurar".
  await expect(dialog.getByText("Antes de restaurar")).toHaveCount(0);
  const [slug, pageId] = hash.slice(3).split("/");
  expect((await (await request.get(`/api/manuals/${slug}/pages/${pageId}`)).json()).body).toContain("DOIS");
});

test("comparar: textos iguais mostram Sem diferenças", async ({ page, request }) => {
  const dialog = await openCompare(page, await seed(request, "Manual Comparar Vazio", "igual\ntexto", "igual\ntexto"));
  await expect(dialog.getByText("Sem diferenças")).toBeVisible();
  await expect(dialog.getByRole("region")).toHaveCount(0);
  expect(await grave(page)).toEqual([]);
});

test("comparar: página de 5000 linhas abre sem travar", async ({ page, request }) => {
  const lines = (f: (i: number) => string) => Array.from({ length: 5000 }, (_, i) => f(i)).join("\n");
  const hash = await seed(
    request,
    "Manual Comparar Grande",
    lines((i) => `linha ${i}`),
    lines((i) => (i % 500 === 0 ? `mudou ${i}` : `linha ${i}`)),
  );
  const t0 = Date.now();
  const dialog = await openCompare(page, hash);
  await expect(dialog.getByRole("region", { name: "Texto atual da página" })).toContainText("Adicionada: mudou 0");
  expect(Date.now() - t0).toBeLessThan(8000);
  await expect(dialog.getByRole("region", { name: "Versão guardada: Aprovada" }).getByText(/^Removida:/)).toHaveCount(10);
});

test("comparar em inglês: nomes e estado vazio traduzidos", async ({ browser, request }) => {
  const hash = await seed(request, "Manual Compare En", "a", "a");
  const ctx = await browser.newContext({ locale: "en-US" });
  const page = await ctx.newPage();
  await page.goto(hash);
  await page.getByRole("button", { name: /^Versions/ }).click();
  await page.getByRole("button", { name: "Compare with current" }).click();
  await expect(page.getByText("No differences")).toBeVisible();
  await ctx.close();
});
