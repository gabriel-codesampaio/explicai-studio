import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// T-543: Ctrl+P também busca no texto das páginas (seção "No texto"), sem acento nem caixa, sem lixeira.
async function setup(request: import("@playwright/test").APIRequestContext) {
  const m = await (await request.post("/api/manuals", { data: { title: "Busca Texto", language: "pt-BR" } })).json();
  const add = async (title: string, body: string) =>
    (await (await request.post(`/api/manuals/${m.slug}/pages`, { data: { title, body } })).json()) as { id: string };
  const inicio = await add("Início", "Bem-vindo.");
  const pag = await add("Pagamentos", "Para gerar o boleto, abra a tela de cobrança e confirme.");
  const velha = await add("Rascunho velho", "O boleto antigo fica aqui.");
  await request.delete(`/api/manuals/${m.slug}/pages/${velha.id}`);
  return { slug: m.slug as string, inicio, pag };
}

test("Ctrl+P acha termo no texto, com e sem acento, destaca, anuncia a contagem e abre a página", async ({ page, request }) => {
  const { slug, inicio, pag } = await setup(request);
  await page.goto(`/#/${slug}/${inicio.id}`);
  await expect(page.getByRole("textbox", { name: "Título da página" })).toHaveValue("Início");
  await page.keyboard.press("Control+p");
  const box = page.getByRole("combobox", { name: "Buscar por título ou texto" });

  await box.fill("cobranca");
  const hit = page.getByRole("option").filter({ hasText: "Pagamentos" });
  await expect(hit).toHaveCount(1);
  await expect(hit.locator("mark")).toHaveText("cobrança");
  await expect(page.getByRole("dialog").getByRole("status")).toHaveText("1 resultado");
  await expect(page.getByText("No texto")).toBeVisible();

  await box.fill("COBRANÇA");
  await expect(page.getByRole("option")).toHaveCount(1);

  const axe = await new AxeBuilder({ page }).exclude("#conteudo").analyze();
  expect(axe.violations).toEqual([]);

  await page.keyboard.press("Enter");
  await expect(page.getByRole("textbox", { name: "Título da página" })).toHaveValue("Pagamentos");
  expect(page.url()).toContain(pag.id);
});

test("página na lixeira não aparece; 1 letra não busca no texto; sem resultado mostra estado vazio", async ({
  page,
  request,
}) => {
  const { slug, inicio } = await setup(request);
  await page.goto(`/#/${slug}/${inicio.id}`);
  await expect(page.getByRole("textbox", { name: "Título da página" })).toHaveValue("Início");
  await page.keyboard.press("Control+p");
  const box = page.getByRole("combobox", { name: "Buscar por título ou texto" });

  await box.fill("boleto");
  await expect(page.getByRole("option")).toHaveCount(1); // só "Pagamentos"; o antigo está na lixeira
  await expect(page.getByRole("option")).not.toContainText("Rascunho velho");

  await box.fill("b");
  await expect(page.getByText("No texto")).toHaveCount(0);

  await box.fill("zzzzqq");
  await expect(page.getByText("Nenhum resultado.").first()).toBeVisible();
  await expect(page.getByRole("option")).toHaveCount(0);
});
