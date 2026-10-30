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

test("Enter no texto cria parágrafo em página com texto, imagem e texto vindos da API", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Enter", []);
  await request.post(`/api/manuals/${slug}/pages`, {
    data: {
      title: "Com imagem",
      body: `Antes da tela.

![Tela](../assets/tela.png)

Depois da tela.`,
    },
  });
  await page.goto(`/#/${slug}`);
  await page.getByRole("button", { name: "Com imagem", exact: true }).click();
  const paragraphs = editor(page).locator("p");
  await expect(paragraphs).toHaveCount(3);
  await editor(page).getByText("Depois da tela.").click();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(paragraphs).toHaveCount(4);
  await expect(editor(page).locator(".node-image")).toHaveCount(1);
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

  await page.keyboard.press("Shift+F10");
  await expect(page.getByRole("menuitem", { name: "Excluir página" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menuitem", { name: "Excluir página" })).toBeHidden();
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

test("versões: guarda, edita, restaura e o texto anterior vira versão", async ({ page, request }) => {
  const { slug, pages } = await setup(request, "Manual Versões", ["Cadastro"]);
  await page.goto(`/#/${slug}/${pages[0]?.id}`);
  await editor(page).click();
  await page.keyboard.type("Texto aprovado.");
  await expect(page.getByRole("status")).toContainText("Salvo às");

  await page.getByRole("button", { name: /^Versões/ }).click();
  const dialog = page.getByRole("dialog", { name: "Versões desta página" });
  await dialog.getByLabel("Nome da versão (opcional)").fill("Aprovada");
  await dialog.getByRole("button", { name: "Guardar versão" }).click();
  await dialog.getByRole("button", { name: "Usar no manual" }).click();
  await expect(dialog.getByText("No manual", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByText("O manual final usa uma versão guardada desta página.", { exact: false })).toBeVisible();

  await editor(page).click();
  await page.keyboard.press("Control+a");
  await page.keyboard.type("Rascunho novo.");
  await page.getByRole("button", { name: /^Versões/ }).click();
  await dialog.getByRole("button", { name: "Restaurar" }).click();

  await expect(dialog).toBeHidden();
  await expect(editor(page)).toHaveText("Texto aprovado.");
  await page.getByRole("button", { name: /^Versões/ }).click();
  await expect(dialog.getByText("Antes de restaurar")).toBeVisible();
});

test("Ctrl+P busca a página pelo título, sem acento, e abre com Enter", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Busca", ["Início", "Relatórios de vendas"]);
  await page.goto(`/#/${slug}`);
  await expect(page.getByRole("textbox", { name: "Título da página" })).toHaveValue("Início");

  await page.keyboard.press("Control+p");
  await page.getByRole("combobox", { name: "Buscar página pelo título" }).fill("relatorio");
  await expect(page.getByRole("option")).toHaveCount(1);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("textbox", { name: "Título da página" })).toHaveValue("Relatórios de vendas");
});

test("a árvore e a busca mostram a numeração do sumário, como 2.1 numa subpágina", async ({ page, request }) => {
  const { slug, pages } = await setup(request, "Manual Numerado", ["Início", "Clientes"]);
  await request.post(`/api/manuals/${slug}/pages`, { data: { title: "Cadastro", parentId: pages[1]?.id } });
  await page.goto(`/#/${slug}`);
  await expect(page.getByRole("textbox", { name: "Título da página" })).toHaveValue("Início");
  await expect(treePage(page, "Cadastro")).toContainText("2.1");

  await page.keyboard.press("Control+p");
  await page.getByRole("combobox", { name: "Buscar página pelo título" }).fill("cadastro");
  await expect(page.getByRole("option")).toContainText("2.1");
});

test("marcação: arrasta o destaque com Selecionar e Desfazer volta ao lugar", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Mover", ["Tela"]);
  await page.goto(`/#/${slug}`);
  await editor(page).click();
  await page.locator('input[type="file"]').setInputFiles(IMAGE);
  const img = editor(page).getByRole("img", { name: "tela" });
  await img.click();
  await page.getByRole("button", { name: "Marcar imagem" }).click();

  const dialog = page.getByRole("dialog", { name: "Marcar imagem" });
  const box = await dialog.getByRole("img").boundingBox();
  if (!box) throw new Error("imagem sem tamanho");
  const at = (fx: number, fy: number) => [box.x + box.width * fx, box.y + box.height * fy] as const;
  const dragFrom = async (a: readonly [number, number], b: readonly [number, number]) => {
    await page.mouse.move(...a);
    await page.mouse.down();
    await page.mouse.move(...b, { steps: 5 });
    await page.mouse.up();
  };

  await dialog.getByRole("button", { name: "Destaque" }).click();
  await dragFrom(at(0.1, 0.1), at(0.3, 0.3));
  await dialog.getByRole("button", { name: "Selecionar" }).click();
  await dragFrom(at(0.2, 0.2), at(0.6, 0.2));

  const leftOf = () =>
    dialog
      .locator(".border-marca")
      .first()
      .evaluate((el) => (el as HTMLElement).style.left);
  expect(Number.parseFloat(await leftOf())).toBeGreaterThan(40);
  await dialog.getByRole("button", { name: "Desfazer" }).click();
  expect(Number.parseFloat(await leftOf())).toBeLessThan(15);
});

test.describe("interface em inglês", () => {
  test.use({ locale: "en-US" });

  test("navegador em inglês abre o Studio em inglês, e o manual novo nasce em inglês", async ({ page, request }) => {
    const { slug } = await setup(request, "Manual English", ["Start"]);
    await page.goto(`/#/${slug}`);
    await expect(page.getByRole("button", { name: "New page" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Page content" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    await page.getByRole("button", { name: "Manual English" }).click();
    await page.getByRole("menuitem", { name: "New manual" }).click();
    await page.getByLabel("Manual name").fill("Billing");
    await page.getByRole("button", { name: "Create manual" }).click();
    const created = (await (await request.get("/api/manuals")).json()).find((m: { title: string }) => m.title === "Billing");
    expect(created.language).toBe("en-US");
  });
});

test("Aparência mostra só Tema e Idioma, e o Studio fica no cobalto mesmo com cor antiga gravada", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Aparência", ["Início"]);
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("semeado")) {
      localStorage.setItem("explicai:aparencia", '{"mode":"dark","accent":"ameixa"}');
      sessionStorage.setItem("semeado", "1");
    }
  });
  await page.goto(`/#/${slug}`);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).not.toHaveAttribute("data-accent", /.*/);

  await page.getByRole("button", { name: "Aparência", exact: true }).click();
  await expect(page.getByRole("group", { name: "Tema" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Idioma da interface" })).toBeVisible();
  await expect(page.getByText("Cor de destaque")).toHaveCount(0);
  await expect(page.getByRole("dialog").getByRole("button")).toHaveCount(5); // 3 temas + 2 idiomas

  // Cobalto nos dois temas: --primary pinta botões, foco e marcadores.
  const primary = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--primary").trim());
  expect(await primary()).toBe("#8098ff");
  await page.getByRole("button", { name: "Claro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await primary()).toBe("#2b4fe0");
  expect(await page.evaluate(() => localStorage.getItem("explicai:aparencia"))).toBe('{"mode":"light"}');
  expect(errors).toEqual([]);
});

test("exportação mostra o nome de cada cor do manual", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Cores", ["Início"]);
  await page.goto(`/#/${slug}`);
  await page.getByRole("button", { name: "Exportar manual" }).click();
  const colors = page.getByRole("dialog").getByRole("group", { name: "Cor do manual" });
  // O botão não tem aria-label: o nome acessível é o texto visível ao lado da bolinha.
  for (const name of ["Cobalto", "Esmeralda", "Ameixa", "Grafite"])
    await expect(colors.getByRole("button", { name, exact: true })).toBeVisible();
  await expect(colors.getByRole("button", { name: "Cobalto" })).toHaveAttribute("aria-pressed", "true");

  await colors.getByRole("button", { name: "Ameixa" }).click();
  await expect(colors.getByRole("button", { name: "Ameixa" })).toHaveAttribute("aria-pressed", "true");
  await expect(colors.getByRole("button", { name: "Cobalto" })).toHaveAttribute("aria-pressed", "false");

  await page.getByRole("dialog").getByRole("button", { name: "Exportar", exact: true }).click();
  const link = page.getByRole("dialog").getByRole("link", { name: "Abrir o arquivo" });
  await expect(link).toBeVisible();
  const exported = await (await request.get((await link.getAttribute("href")) ?? "")).text();
  expect(exported).toContain("--accent:#7a3fc4");
  // O Studio continua no cobalto depois de escolher a cor do manual.
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--primary").trim())).toMatch(
    /^#(2b4fe0|8098ff)$/,
  );
});
