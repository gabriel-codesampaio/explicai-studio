import path from "node:path";
import { type APIRequestContext, expect, type Page, test } from "@playwright/test";

const IMAGE = path.join(import.meta.dirname, "fixtures", "tela.png");

/** Cria um manual (e páginas) pela API, para cada teste começar num manual próprio. */
async function setup(request: APIRequestContext, title: string, pages: string[] = []) {
  const manual = await (await request.post("/api/manuals", { data: { title } })).json();
  const created: { id: string; title: string; file: string }[] = [];
  for (const t of pages)
    created.push(await (await request.post(`/api/manuals/${manual.slug}/pages`, { data: { title: t } })).json());
  return { slug: manual.slug as string, pages: created };
}

const editor = (page: Page) => page.getByRole("textbox", { name: "Conteúdo da página" });
const treePage = (page: Page, title: string) =>
  page.getByRole("navigation", { name: "Páginas do manual" }).getByRole("button", { name: title, exact: true });

test("primeiro uso: cria manual e página, escreve e o texto continua lá depois de recarregar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Qual sistema você vai explicar?" })).toBeVisible();
  await page.getByLabel("Nome do manual").fill("Manual do Primeiro Uso");
  await page.getByRole("button", { name: "Criar manual" }).click();

  await page.getByRole("button", { name: "Criar a primeira página" }).click();
  const title = page.getByRole("textbox", { name: "Título da página" });
  await expect(title).toBeFocused();
  await title.fill("Cadastrar cliente");
  await title.press("Enter");
  await expect(editor(page)).toBeFocused();
  await page.keyboard.type("Clique em Novo cliente.");

  await expect(page.getByRole("status")).toContainText("Salvo às");
  await expect(page.getByText("manual-do-primeiro-uso/pages/cadastrar-cliente.md")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("textbox", { name: "Título da página" })).toHaveValue("Cadastrar cliente");
  await expect(editor(page)).toContainText("Clique em Novo cliente.");
});

test("menu / insere passos numerados", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Barra", ["Passos"]);
  await page.goto(`/#/${slug}`);
  await editor(page).click();
  await page.keyboard.type("/pass");
  await expect(page.getByRole("option", { name: /Passos numerados/ })).toBeVisible();
  await page.keyboard.press("Enter");
  await page.keyboard.type("Abra o menu Clientes.");

  await expect(editor(page).locator("ol li")).toHaveText("Abra o menu Clientes.");
});

test("imagem: envia, descreve, marca e a legenda aparece na página", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Imagem", ["Tela de clientes"]);
  await page.goto(`/#/${slug}`);
  await editor(page).click();
  await page.locator('input[type="file"]').setInputFiles(IMAGE);
  const img = editor(page).getByRole("img", { name: "tela" });
  await expect(img).toBeVisible();

  await img.click();
  const descricao = page.getByRole("textbox", { name: "Descrição da imagem" });
  await descricao.fill("Tela de clientes");
  await page.getByRole("button", { name: "Marcar imagem" }).click();

  const dialog = page.getByRole("dialog", { name: "Marcar imagem" });
  await dialog.getByRole("img").click({ position: { x: 60, y: 60 } });
  await dialog.getByRole("textbox", { name: "O que o marcador 1 mostra" }).fill("Botão Novo cliente");
  await dialog.getByRole("button", { name: "Salvar marcações" }).click();
  await expect(dialog).toBeHidden();

  await expect(page.getByRole("list", { name: "Legenda da imagem" })).toContainText("Botão Novo cliente");
  const saved = await (await request.get(`/api/manuals/${slug}/annotations?asset=assets/tela.png`)).json();
  expect(saved.markers).toMatchObject([{ n: 1, label: "Botão Novo cliente" }]);
});

test("excluir página vai para a lixeira e Desfazer traz de volta", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Lixeira", ["Fica", "Sai"]);
  await page.goto(`/#/${slug}`);
  await page.getByRole("button", { name: "Mais ações para Sai" }).click();
  await page.getByRole("menuitem", { name: "Excluir página" }).click();

  await expect(treePage(page, "Sai")).toHaveCount(0);
  await expect(page.getByText('"Sai" foi para a lixeira.')).toBeVisible();
  await page.getByRole("button", { name: "Desfazer" }).click();
  await expect(treePage(page, "Sai")).toBeVisible();
});

test("árvore pelo teclado: Alt+Shift+↓ desce a página", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Teclado", ["Primeira", "Segunda"]);
  await page.goto(`/#/${slug}`);
  await treePage(page, "Primeira").focus();
  await page.keyboard.press("Alt+Shift+ArrowDown");

  await expect(async () => {
    const tree = await (await request.get(`/api/manuals/${slug}`)).json();
    expect(tree.pages.map((p: { title: string }) => p.title)).toEqual(["Segunda", "Primeira"]);
  }).toPass();
  await expect(treePage(page, "Primeira")).toBeFocused();
});

test("link: recusa endereço inválido e liga a outra página do manual", async ({ page, request }) => {
  const { slug, pages } = await setup(request, "Manual Link", ["Origem", "Destino"]);
  await page.goto(`/#/${slug}/${pages[0]?.id}`);
  await editor(page).click();
  await page.keyboard.type("veja aqui");
  await page.keyboard.press("Shift+Home");
  await page.keyboard.press("Control+k");

  const campo = page.getByLabel("Link para uma página ou endereço");
  await campo.fill("clientes painel");
  await campo.press("Enter");
  await expect(page.getByRole("alert")).toContainText("não pode ter espaços");

  await campo.fill("Dest");
  await page.getByRole("dialog", { name: "Editar link" }).getByRole("button", { name: "Destino" }).click();
  await expect(editor(page).locator("a")).toHaveAttribute("href", "./destino.md");
});
