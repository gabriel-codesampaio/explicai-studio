import { type APIRequestContext, expect, type Page, test } from "@playwright/test";
import { settleEditor } from "./editor-sync.js";

// Código no texto e link no editor (T-083): barra, menu de seleção, atalhos, Markdown e exportação.
async function open(page: Page, request: APIRequestContext, title: string, body = "") {
  const manual = await (await request.post("/api/manuals", { data: { title } })).json();
  const created = await (await request.post(`/api/manuals/${manual.slug}/pages`, { data: { title: "Texto", body } })).json();
  await page.goto(`/#/${manual.slug}/${created.id}`);
  await expect(editor(page)).toBeVisible();
  return { slug: manual.slug as string, id: created.id as string };
}

const editor = (page: Page) => page.getByRole("textbox", { name: "Conteúdo da página" });
const toolbar = (page: Page) => page.getByRole("toolbar", { name: "Formatação" });
const codeBtn = (page: Page) => toolbar(page).getByRole("button", { name: "Código no texto" });
const linkBtn = (page: Page) => toolbar(page).getByRole("button", { name: "Link" });
const dialog = (page: Page) => page.getByRole("dialog", { name: "Editar link" });
const field = (page: Page) => page.getByLabel("Link para uma página ou endereço");
const saved = (page: Page) => expect(page.getByRole("status").filter({ hasText: "Salvo às" })).toBeVisible();

/**
 * Seleciona a palavra "alvo" com duplo clique. Com Shift+setas o ProseMirror lê a seleção depois (selectionchange)
 * e um botão clicado logo em seguida agia só numa parte da palavra.
 */
async function selectWord(page: Page, container: string) {
  const box = await editor(page)
    .getByText(container)
    .evaluate((el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const i = n.textContent?.lastIndexOf("alvo") ?? -1;
        if (i < 0) continue;
        const r = document.createRange();
        r.setStart(n, i);
        r.setEnd(n, i + 4);
        const { x, y, width, height } = r.getBoundingClientRect();
        return { x: x + width / 2, y: y + height / 2 };
      }
      throw new Error("alvo não encontrado");
    });
  await page.mouse.dblclick(box.x, box.y);
  // O ProseMirror guarda a seleção no selectionchange; dois quadros depois ela já está nele.
  await expect.poll(() => page.evaluate(() => getSelection()?.toString())).toBe("alvo");
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

async function typeAndSelect(page: Page, text: string) {
  await editor(page).click();
  await page.keyboard.type(text);
  await settleEditor(page);
  await selectWord(page, text);
}

const markdown = async (request: APIRequestContext, slug: string, id: string) =>
  ((await (await request.get(`/api/manuals/${slug}/pages/${id}`)).json()) as { body: string }).body;

async function exportedHtml(page: Page, request: APIRequestContext) {
  await page.getByRole("button", { name: "Exportar manual" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /^Exportar (HTML|PDF|Markdown)$/ })
    .click();
  const file = page.getByRole("dialog").getByRole("link", { name: "Abrir o arquivo" });
  await expect(file).toBeVisible();
  return (await request.get((await file.getAttribute("href")) ?? "")).text();
}

test.describe("código no texto", () => {
  test("barra: aplica e remove na seleção, com aria-pressed", async ({ page, request }) => {
    await open(page, request, "Codigo barra");
    await typeAndSelect(page, "rode alvo");
    await expect(codeBtn(page)).toHaveAttribute("aria-pressed", "false");
    await codeBtn(page).click();
    await expect(editor(page).locator("code")).toHaveText("alvo");
    await expect(codeBtn(page)).toHaveAttribute("aria-pressed", "true");
    await codeBtn(page).click();
    await expect(editor(page).locator("code")).toHaveCount(0);
    await expect(codeBtn(page)).toHaveAttribute("aria-pressed", "false");
  });

  test("menu de seleção: aplica e remove", async ({ page, request }) => {
    await open(page, request, "Codigo menu");
    await typeAndSelect(page, "rode alvo");
    const btn = page.getByRole("toolbar", { name: "Formatar seleção" }).getByRole("button", { name: "Código no texto" });
    await btn.click();
    await expect(editor(page).locator("code")).toHaveText("alvo");
    await expect(btn).toHaveAttribute("aria-pressed", "true");
    await btn.click();
    await expect(editor(page).locator("code")).toHaveCount(0);
  });

  test("atalho Ctrl+E: aplica na seleção e, sem seleção, vale para o que for digitado depois", async ({ page, request }) => {
    await open(page, request, "Codigo atalho");
    await typeAndSelect(page, "rode alvo");
    await page.keyboard.press("Control+e");
    await expect(editor(page).locator("code")).toHaveText("alvo");
    // O cursor no fim do código continua nele: digitar estende, e Ctrl+E de novo sai.
    await page.keyboard.press("ArrowRight");
    await settleEditor(page);
    await expect(codeBtn(page)).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Control+e");
    await expect(codeBtn(page)).toHaveAttribute("aria-pressed", "false");
    await page.keyboard.type(" fim");
    await expect(editor(page).locator("code")).toHaveText("alvo");
    await page.keyboard.press("Control+e");
    await page.keyboard.type("!");
    await expect(editor(page).locator("code").last()).toHaveText("!");
  });

  test("sem seleção, o botão da barra liga o código para o texto digitado depois", async ({ page, request }) => {
    await open(page, request, "Codigo sem selecao");
    await editor(page).click();
    await page.keyboard.type("rode ");
    await codeBtn(page).click();
    await page.keyboard.type("npm");
    await expect(editor(page).locator("code")).toHaveText("npm");
  });

  test("convive com negrito e link, dentro de título e de passo, e volta como `código` no Markdown", async ({
    page,
    request,
  }) => {
    const { slug, id } = await open(page, request, "Codigo mistura", "# Titulo alvo\n\n1. passo alvo\n\ntexto alvo\n");
    await selectWord(page, "Titulo alvo");
    await codeBtn(page).click();
    await expect(editor(page).locator("h1 code")).toHaveText("alvo");

    await selectWord(page, "texto alvo");
    await page.keyboard.press("Control+b");
    await codeBtn(page).click();
    await expect(editor(page).locator("p code")).toHaveText("alvo");
    await expect(editor(page).locator("p strong")).toHaveText("alvo");
    await linkBtn(page).click();
    await field(page).fill("exemplo.com.br");
    await field(page).press("Enter");
    await expect(editor(page).locator("p a")).toHaveAttribute("href", "https://exemplo.com.br");
    await expect(editor(page).locator("p a code")).toHaveCount(1);

    await selectWord(page, "passo alvo");
    await codeBtn(page).click();
    await expect(editor(page).locator("li code")).toHaveText("alvo");

    await saved(page);
    expect(await markdown(request, slug, id)).toContain("`alvo`");
    await page.reload();
    await expect(editor(page).locator("h1 code")).toHaveText("alvo");
    await expect(editor(page).locator("li code")).toHaveText("alvo");
    await expect(editor(page).locator("a code")).toHaveText("alvo");
    await expect(editor(page).locator("a strong")).toHaveText("alvo");
  });

  test("aparência no editor (claro e escuro) e no manual exportado", async ({ page, request }) => {
    await open(page, request, "Codigo visual", "rode `npm test` agora\n");
    const style = () =>
      editor(page)
        .locator("code")
        .evaluate((el) => {
          const c = getComputedStyle(el);
          return { bg: c.backgroundColor, fg: c.color, font: c.fontFamily, border: c.borderTopWidth };
        });
    const light = await style();
    expect(light.font).toMatch(/mono|Consolas|Courier/i);
    expect(light.border).toBe("1px");
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
    const dark = await style();
    expect(dark.bg).not.toBe(light.bg);
    expect(dark.fg).not.toBe(dark.bg);

    const html = await exportedHtml(page, request);
    expect(html).toContain("<code>npm test</code>");
    expect(html).toContain(".page-body code{font:.88em var(--mono)");
  });
});

test.describe("link", () => {
  test("cria com seleção, persiste depois de salvar e recarregar e sai no export com rel", async ({ page, request }) => {
    const { slug, id } = await open(page, request, "Link cria");
    await typeAndSelect(page, "veja alvo");
    await linkBtn(page).click();
    await expect(dialog(page)).toBeVisible();
    await field(page).fill("exemplo.com.br/ajuda");
    await field(page).press("Enter");
    await expect(editor(page).locator("a")).toHaveAttribute("href", "https://exemplo.com.br/ajuda");
    await expect(linkBtn(page)).toHaveAttribute("aria-pressed", "true");
    await saved(page);
    expect(await markdown(request, slug, id)).toContain("[alvo](https://exemplo.com.br/ajuda)");
    await page.reload();
    await expect(editor(page).locator("a")).toHaveAttribute("href", "https://exemplo.com.br/ajuda");

    const html = await exportedHtml(page, request);
    expect(html).toContain('<a href="https://exemplo.com.br/ajuda" rel="noopener noreferrer">alvo</a>');
  });

  test("Ctrl+K abre com o foco no campo, Esc fecha e devolve o foco ao texto", async ({ page, request }) => {
    await open(page, request, "Link teclado");
    await typeAndSelect(page, "veja alvo");
    await page.keyboard.press("Control+k");
    await expect(dialog(page)).toBeVisible();
    await expect(field(page)).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeHidden();
    await expect(editor(page)).toBeFocused();
    await expect(editor(page).locator("a")).toHaveCount(0);
  });

  test("sem seleção: o link vale para o texto digitado depois", async ({ page, request }) => {
    await open(page, request, "Link sem selecao");
    await editor(page).click();
    await page.keyboard.type("veja ");
    await page.keyboard.press("Control+k");
    await field(page).fill("exemplo.com.br");
    await field(page).press("Enter");
    await expect(editor(page)).toBeFocused();
    await page.keyboard.type("aqui");
    await expect(editor(page).locator("a")).toHaveText("aqui");
  });

  test("edita e remove o link em que o cursor está", async ({ page, request }) => {
    await open(page, request, "Link edita", "veja [alvo](https://velho.com.br) fim\n");
    await editor(page).locator("a").click();
    await settleEditor(page);
    await page.keyboard.press("Control+k");
    await expect(field(page)).toHaveValue("https://velho.com.br");
    await field(page).fill("novo.com.br");
    await field(page).press("Enter");
    await expect(dialog(page)).toBeHidden();
    await expect(editor(page).locator("a")).toHaveAttribute("href", "https://novo.com.br");
    await expect(editor(page).locator("a")).toHaveText("alvo");

    await editor(page).locator("a").click();
    await settleEditor(page);
    await linkBtn(page).click();
    await dialog(page).getByRole("button", { name: "Remover link" }).click();
    await expect(editor(page).locator("a")).toHaveCount(0);
    await expect(editor(page)).toContainText("veja alvo fim");
  });

  test("recusa endereço inválido e esquemas perigosos, sem criar link", async ({ page, request }) => {
    await open(page, request, "Link recusa");
    await typeAndSelect(page, "veja alvo");
    await page.keyboard.press("Control+k");
    for (const bad of ["javascript:alert(1)", "data:text/html,x", "ftp://exemplo.com", "http://", "semdominio"]) {
      await field(page).fill(bad);
      await field(page).press("Enter");
      await expect(page.getByRole("alert")).toBeVisible();
      await expect(dialog(page)).toBeVisible();
    }
    await expect(editor(page).locator("a")).toHaveCount(0);
  });

  test("Markdown com javascript: não vira link ativo no editor nem no export", async ({ page, request }) => {
    await open(page, request, "Link perigoso", "[clique](javascript:alert(1)) fim\n");
    const href = await editor(page)
      .locator("a")
      .first()
      .getAttribute("href", { timeout: 1000 })
      .catch(() => null);
    expect(href ?? "").not.toMatch(/^javascript:/i);
    const html = await exportedHtml(page, request);
    expect(html).not.toMatch(/href="javascript:/i);
  });
});

// T-140: o menu "Texto ▾" da barra sobre a seleção abre ancorado no botão, não no canto da tela.
test("menu de tipo de bloco da barra da seleção abre junto do botão", async ({ page, request }) => {
  await open(page, request, "Manual Menu Bloco", "Texto com alvo");
  await editor(page).click();
  await selectWord(page, "Texto com alvo");
  const bar = page.getByRole("toolbar", { name: "Formatar seleção" });
  const trigger = bar.getByRole("button", { name: /Tipo de bloco/ });
  await expect(trigger).toBeVisible();
  const b = await trigger.boundingBox();
  await trigger.click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  const m = await menu.boundingBox();
  expect(Math.abs((m?.x ?? 0) - (b?.x ?? 0))).toBeLessThan(40);
  expect(Math.abs((m?.y ?? 0) - ((b?.y ?? 0) + (b?.height ?? 0)))).toBeLessThan(40);
  await menu.getByRole("menuitem", { name: "Título 1" }).click();
  await expect(editor(page).locator("h1")).toHaveText("Texto com alvo");
});
