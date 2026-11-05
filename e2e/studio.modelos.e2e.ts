import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// T-546: modelo de página na criação. "Nova página" segue criando em branco; o menu ao lado escolhe o modelo.
async function abrir(
  page: import("@playwright/test").Page,
  request: import("@playwright/test").APIRequestContext,
  language: string,
) {
  const manual = await (await request.post("/api/manuals", { data: { title: `Modelos ${language}`, language } })).json();
  const first = await (await request.post(`/api/manuals/${manual.slug}/pages`, { data: { title: "Início" } })).json();
  await page.goto(`/#/${manual.slug}/${first.id}`);
  return manual.slug as string;
}

const bodies = async (request: import("@playwright/test").APIRequestContext, slug: string) => {
  const detail = await (await request.get(`/api/manuals/${slug}`)).json();
  const ids: string[] = detail.pages.map((p: { id: string }) => p.id);
  return Promise.all(
    ids.map(async (id) => (await (await request.get(`/api/manuals/${slug}/pages/${id}`)).json()).body as string),
  );
};

test("Nova página continua criando em branco, sem passo extra", async ({ page, request }) => {
  const slug = await abrir(page, request, "pt-BR");
  await page.getByRole("button", { name: "Nova página" }).click();
  await expect(page.getByRole("textbox", { name: /título/i }).first()).toBeFocused();
  const all = await bodies(request, slug);
  expect(all).toHaveLength(2);
  expect(all[1]?.trim()).toBe("");
});

test("menu de modelos: tarefa e referência em pt, pelo teclado, com axe limpo", async ({ page, request }) => {
  const slug = await abrir(page, request, "pt-BR");
  const trigger = page.getByRole("button", { name: "Escolher um modelo de página" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menuitem")).toHaveText(["Em branco", "Tarefa passo a passo", "Referência de campos"]);
  // Regras de página inteira (h1, região, rolagem) já falham sem o menu e não são desta fatia.
  const axe = await new AxeBuilder({ page })
    .disableRules(["page-has-heading-one", "region", "scrollable-region-focusable"])
    .analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
  await page.getByRole("menuitem", { name: "Tarefa passo a passo" }).press("Enter");
  await expect(page.getByRole("heading", { name: "Passo a passo" })).toBeVisible();

  await trigger.click();
  await page.getByRole("menuitem", { name: "Referência de campos" }).click();
  await expect(page.getByRole("columnheader", { name: "Campo", exact: true })).toBeVisible();

  await trigger.click();
  await page.getByRole("menuitem", { name: "Em branco" }).click();
  // T-569: o Radix não devolve o foco ao gatilho; ele fica no título da página criada.
  await expect(page.getByRole("textbox", { name: /título/i }).first()).toBeFocused();
  await expect.poll(async () => (await bodies(request, slug)).length).toBe(4);
  await page.waitForTimeout(1500); // deixa o salvamento automático correr
  const all = (await bodies(request, slug)).join("\n=====\n");
  expect(all).toContain("Resultado:");
  expect(all).toContain("Antes de começar");
  expect(all).toContain("| Campo | O que é | Obrigatório |");
  expect(all).toContain("- [O que você precisa ter em mãos.]");
});

test("manual em inglês recebe o modelo em inglês", async ({ page, request }) => {
  const slug = await abrir(page, request, "en");
  await page.getByRole("button", { name: "Escolher um modelo de página" }).click();
  await page.getByRole("menuitem", { name: "Tarefa passo a passo" }).click();
  await expect(page.getByRole("heading", { name: "Step by step" })).toBeVisible();
  await page.waitForTimeout(1500);
  const all = (await bodies(request, slug)).join("\n");
  expect(all).toContain("Result:");
  expect(all).not.toContain("Resultado:");
});

test("Esc fecha o menu de modelos e devolve o foco ao gatilho", async ({ page, request }) => {
  await abrir(page, request, "pt-BR");
  const trigger = page.getByRole("button", { name: "Escolher um modelo de página" });
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menuitem").first()).toBeHidden();
  await expect(trigger).toBeFocused();
});
