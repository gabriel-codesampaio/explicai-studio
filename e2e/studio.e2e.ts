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

test('barra: "Colar print" mostra o Ctrl+V, abre o seletor de arquivo e a dica do / fica só no placeholder', async ({
  page,
  request,
}) => {
  const { slug } = await setup(request, "Manual Colar Print", ["Início"]);
  await page.goto(`/#/${slug}`);
  const toolbar = page.getByRole("toolbar", { name: "Formatação" });
  const button = toolbar.getByRole("button", { name: "Colar print" });
  await expect(button).toContainText("Ctrl+V");
  await expect(toolbar.getByText("para inserir blocos")).toHaveCount(0);
  const chooser = page.waitForEvent("filechooser");
  await button.click();
  await (await chooser).setFiles(IMAGE);
  await expect(editor(page).getByRole("img", { name: "tela" })).toBeVisible();
});

test("barra da seleção: selecionar texto abre a barra, pinta de vermelho, põe negrito e a cor fica depois de recarregar", async ({
  page,
  request,
}) => {
  const { slug } = await setup(request, "Manual Cor", ["Início"]);
  await page.goto(`/#/${slug}`);
  await editor(page).click();
  await page.keyboard.type("Clique em Excluir");
  await page.keyboard.press("Shift+Control+ArrowLeft");

  const menu = page.getByRole("toolbar", { name: "Formatar seleção" });
  await expect(menu).toBeVisible();
  await menu.getByRole("button", { name: "Cor do texto" }).click();
  await page.getByRole("menuitem", { name: "Vermelho" }).click();
  await menu.getByRole("button", { name: "Negrito" }).click();

  const red = editor(page).locator('[data-color="red"]');
  await expect(red).toHaveText("Excluir");
  await expect(editor(page).locator("strong")).toHaveText("Excluir");
  await expect(page.getByRole("status")).toContainText("Salvo às");

  await page.reload();
  await expect(editor(page).locator('[data-color="red"]')).toHaveText("Excluir");
  await editor(page).click();
  await expect(page.getByRole("toolbar", { name: "Formatar seleção" })).toBeHidden();
});

test("cor do texto pela barra fixa, só com o teclado, e a dica mostra o nome", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Cor Teclado", ["Início"]);
  await page.goto(`/#/${slug}`);
  await editor(page).click();
  await page.keyboard.type("Clique em Excluir");
  const toolbar = page.getByRole("toolbar", { name: "Formatação" });
  const trigger = toolbar.getByRole("button", { name: "Cor do texto" });
  await trigger.hover();
  await expect(page.getByRole("tooltip")).toContainText("Cor do texto");
  await page.keyboard.press("Shift+Control+ArrowLeft");

  // Sai do editor para a barra fixa e anda pelas setas até o botão de cor.
  await page.keyboard.press("Shift+Tab");
  await toolbar.getByRole("button", { name: /Tipo de bloco/ }).focus();
  while (!(await trigger.evaluate((el) => el === document.activeElement))) await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  const items = page.getByRole("menuitem");
  await expect(items.filter({ hasText: "Cor padrão" })).toBeVisible();
  await expect(items.filter({ hasText: "Azul" })).toBeVisible();
  await expect(items.filter({ hasText: "Cor padrão" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(items.filter({ hasText: "Cinza" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(items.filter({ hasText: "Vermelho" })).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(editor(page).locator('[data-color="red"]')).toHaveText("Excluir");
  await expect(editor(page)).toBeFocused();
  await page.keyboard.press("Escape");
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
  await expect(dialog.getByText("Versão do manual", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByText("O manual final usa a Versão do manual desta página.", { exact: false })).toBeVisible();

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

  await page.getByRole("button", { name: "Ajustes" }).click();
  await page.getByRole("menuitem", { name: "Aparência" }).click();
  await expect(page.getByRole("group", { name: "Tema" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Idioma da interface" })).toBeVisible();
  await expect(page.getByText("Cor de destaque")).toHaveCount(0);
  await expect(page.getByRole("dialog").getByRole("button")).toHaveCount(6); // 3 temas + 2 idiomas + Fechar

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
  // As cores ficam dentro de "Cores do manual", fechado por padrão.
  await page.getByRole("dialog").getByText("Cores do manual").click();
  const colors = page.getByRole("dialog");
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

test('exportação: "Só páginas aprovadas" fica desabilitado sem página aprovada', async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Sem Aprovadas", ["Início"]);
  await page.goto(`/#/${slug}`);
  await page.getByRole("button", { name: "Exportar manual" }).click();
  await expect(page.getByRole("dialog").getByRole("checkbox", { name: /Só páginas aprovadas/ })).toBeDisabled();
  await expect(page.getByRole("dialog").getByText("Nenhuma página está aprovada ou publicada.")).toBeVisible();
});

test("barra: troca de manual pelo cabeçalho e abre a busca pela linha", async ({ page, request }) => {
  const a = await setup(request, "Manual Cabeçalho A", ["Alfa"]);
  await setup(request, "Manual Cabeçalho B", ["Beta"]);
  await page.goto(`/#/${a.slug}`);

  const switcher = page.getByRole("button", { name: /Manual Cabeçalho A/ });
  await switcher.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("menuitem", { name: "Manual Cabeçalho B" }).click();
  await expect(page.getByRole("textbox", { name: "Título da página" })).toHaveValue("Beta");

  await page.getByRole("button", { name: /Buscar página/ }).click();
  await expect(page.getByRole("combobox", { name: "Buscar página pelo título" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("combobox", { name: "Buscar página pelo título" })).toBeHidden();
});

test("barra enxuta: Exportar só no topo e Lixeira, Aparência e Atalhos pelo menu Ajustes, com foco de volta", async ({
  page,
  request,
}) => {
  const { slug } = await setup(request, "Manual Menu", ["Início"]);
  await page.goto(`/#/${slug}`);
  const sidebar = page.locator("aside").first();
  await expect(sidebar.getByRole("button", { name: "Exportar manual" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Exportar manual" })).toHaveCount(1);
  const more = page.getByRole("button", { name: "Ajustes" });
  for (const [item, title] of [
    ["Lixeira", "Lixeira deste manual"],
    ["Aparência", "Aparência"],
    ["Atalhos", "Atalhos de teclado"],
  ] as const) {
    await more.click();
    await page.getByRole("menuitem", { name: item }).click();
    await expect(page.getByRole("dialog", { name: title })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(more).toBeFocused();
  }
});

test("tela estreita: painéis de Ajustes abrem sobre a gaveta, Esc fecha só o painel e o foco volta a Ajustes", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  const { slug } = await setup(request, "Manual Gaveta", ["Início"]);
  await page.goto(`/#/${slug}`);
  await page.getByRole("button", { name: /Mostrar as páginas/ }).click();
  const drawer = page.getByRole("dialog", { name: "Páginas do manual" });
  await expect(drawer).toBeVisible();
  const more = drawer.getByRole("button", { name: "Ajustes" });
  for (const [item, title] of [
    ["Lixeira", "Lixeira deste manual"],
    ["Aparência", "Aparência"],
    ["Atalhos", "Atalhos de teclado"],
  ] as const) {
    await more.click();
    await page.getByRole("menuitem", { name: item }).click();
    await expect(page.getByRole("dialog", { name: title })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: title })).toHaveCount(0);
    await expect(drawer).toBeVisible();
    await expect(more).toBeFocused();
  }
});

test("lixeira: restaurar fecha o painel e mostra a página restaurada", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Restaura", ["Fica", "Sai"]);
  await page.goto(`/#/${slug}`);
  await page.getByRole("button", { name: "Mais ações para Sai" }).click();
  await page.getByRole("menuitem", { name: "Excluir página" }).click();
  await expect(treePage(page, "Sai")).toHaveCount(0);
  await page.getByRole("button", { name: "Ajustes" }).click();
  await page.getByRole("menuitem", { name: "Lixeira" }).click();
  await page.getByRole("dialog", { name: "Lixeira deste manual" }).getByRole("button", { name: "Restaurar" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(treePage(page, "Sai")).toBeVisible();
});

/** Os botões do topo da página, com posição e nome, na ordem em que aparecem na tela. */
async function topButtons(page: Page) {
  return page.evaluate(() => {
    const row = document.querySelector("article nav[aria-label]")?.parentElement as HTMLElement;
    const buttons = [...row.querySelectorAll("button")].map((b) => {
      const r = b.getBoundingClientRect();
      return {
        name: b.getAttribute("aria-label") ?? b.textContent?.trim() ?? "",
        left: r.left,
        top: r.top,
        right: r.right,
        height: r.height,
      };
    });
    return {
      buttons,
      rowRight: row.getBoundingClientRect().right,
      scrollW: document.documentElement.scrollWidth,
      innerW: innerWidth,
    };
  });
}

async function pageWithHeadings(request: APIRequestContext, title: string) {
  const { slug, pages } = await setup(request, title, ["Início"]);
  await request.put(`/api/manuals/${slug}/pages/${pages[0]?.id}`, {
    data: { body: "## Primeiro\n\nTexto.\n\n## Segundo\n\nTexto." },
  });
  return slug;
}

test.describe("botão Exportar manual no topo, em 375 px e em toque", () => {
  test.use({ viewport: { width: 375, height: 800 }, hasTouch: true, isMobile: true });

  test("é o último item, encosta na direita, tem 44 px e segue Versões, Status, Índice no Tab", async ({ page, request }) => {
    const slug = await pageWithHeadings(request, "Manual Exportar Celular");
    await page.goto(`/#/${slug}`);
    await expect(page.getByRole("button", { name: "Exportar manual" })).toBeVisible();
    const { buttons, rowRight, scrollW, innerW } = await topButtons(page);
    expect(buttons.map((b) => b.name.replace(/:.*/, "").replace(/\s+/g, " "))).toEqual([
      "Versões",
      "Status da página",
      "Nesta página",
      "Exportar manual",
    ]);
    const exportBtn = buttons[3];
    // Sem espaço na linha, o Exportar desce para uma linha própria, ainda à direita; nunca fica no meio.
    const others = buttons.slice(0, 3);
    expect(exportBtn?.top ?? 0).toBeGreaterThanOrEqual(Math.max(...others.map((b) => b.top)) - 1);
    if (exportBtn && Math.abs(exportBtn.top - (others[2]?.top ?? 0)) < 1)
      expect(exportBtn.left).toBeGreaterThan(others[2]?.left ?? 0);
    expect(Math.abs((exportBtn?.right ?? 0) - rowRight)).toBeLessThan(1);
    // Alvo de toque: todos os itens do topo têm 44 px.
    for (const b of buttons) expect(b.height).toBeGreaterThanOrEqual(44);
    expect(scrollW).toBeLessThanOrEqual(innerW);

    await page.getByRole("button", { name: "Versões" }).focus();
    for (const name of [/Status da página/, /Nesta página/, /Exportar manual/]) {
      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name })).toBeFocused();
    }
  });
});

test("botão Exportar manual em 1280 px: último à direita, altura de botão primário e único sólido", async ({ page, request }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const slug = await pageWithHeadings(request, "Manual Exportar Desktop");
  await page.goto(`/#/${slug}`);
  await expect(page.getByRole("button", { name: "Exportar manual" })).toBeVisible();
  const { buttons, rowRight } = await topButtons(page);
  expect(buttons.at(-1)?.name).toBe("Exportar manual");
  expect(Math.abs((buttons.at(-1)?.right ?? 0) - rowRight)).toBeLessThan(1);
  expect(buttons.at(-1)?.height).toBe(36);
  // Só ele tem fundo sólido: os vizinhos são texto.
  const bg = await page.evaluate(() =>
    [...(document.querySelector("article nav[aria-label]")?.parentElement?.querySelectorAll("button") ?? [])].map(
      (b) => getComputedStyle(b).backgroundColor,
    ),
  );
  expect(bg.filter((c) => c !== "rgba(0, 0, 0, 0)")).toHaveLength(1);
test.describe("toque", () => {
  test.use({ viewport: { width: 375, height: 800 }, hasTouch: true, isMobile: true });

  test("alvos de toque: itens do menu Ajustes e botões da barra têm 44 px de altura", async ({ page, request }) => {
    const { slug } = await setup(request, "Manual Toque", ["Início"]);
    await page.goto(`/#/${slug}`);
    // offsetHeight ignora a escala da animação de abertura do menu.
    const height = (loc: ReturnType<Page["locator"]>) => loc.evaluate((el) => (el as HTMLElement).offsetHeight);
    expect(await height(page.getByRole("button", { name: "Colar print" }))).toBeGreaterThanOrEqual(44);
    expect(await height(page.getByRole("button", { name: /Tipo de bloco/ }))).toBeGreaterThanOrEqual(44);
    expect(await height(page.getByRole("button", { name: "Negrito" }))).toBeGreaterThanOrEqual(44);
    await page.getByRole("button", { name: /Mostrar as páginas/ }).click();
    await page.getByRole("dialog", { name: "Páginas do manual" }).getByRole("button", { name: "Ajustes" }).click();
    for (const name of ["Lixeira", "Aparência", "Atalhos"])
      expect(await height(page.getByRole("menuitem", { name }))).toBeGreaterThanOrEqual(44);
  });
});

test("exportação no escuro: a borda da amostra de cor se distingue do fundo (3:1)", async ({ page, request }) => {
  await page.addInitScript(() => localStorage.setItem("explicai:aparencia", JSON.stringify({ mode: "dark" })));
  const { slug } = await setup(request, "Manual Escuro", ["Início"]);
  await page.goto(`/#/${slug}`);
  await page.getByRole("button", { name: "Exportar manual" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByText("Cores do manual").click();
  const ratio = await dialog.getByLabel("Cor do texto", { exact: true }).evaluate((swatch) => {
    const rgb = (el: Element, prop: "borderTopColor" | "backgroundColor") =>
      (getComputedStyle(el)[prop].match(/\d+/g) ?? []).slice(0, 3).map(Number);
    const l = (c: number[]) => {
      const [r = 0, g = 0, b = 0] = c.map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const a = l(rgb(swatch, "borderTopColor"));
    const b = l(rgb(swatch.closest("[role=dialog]") as Element, "backgroundColor"));
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
  expect(ratio).toBeGreaterThanOrEqual(3);
});
