import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

async function seed(request: import("@playwright/test").APIRequestContext, title: string) {
  const manual = await (await request.post("/api/manuals", { data: { title } })).json();
  const post = (data: object) => request.post(`/api/manuals/${manual.slug}/pages`, { data });
  await post({ title: "Solo", body: "a", audience: ["aluno"] });
  await post({ title: "Duo", body: "b", audience: ["aluno", "admin"] });
  await post({ title: "Geral", body: "c" });
  return manual.slug as string;
}

const audiencesOf = async (request: import("@playwright/test").APIRequestContext, slug: string) => {
  const m = await (await request.get(`/api/manuals/${slug}`)).json();
  return {
    audiences: m.audiences as string[],
    pages: Object.fromEntries(m.pages.map((p: { title: string; audience?: string[] }) => [p.title, p.audience])),
  };
};

const grave = async (page: Page) =>
  (await new AxeBuilder({ page }).analyze()).violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes[0]?.target}`);

test("públicos: lista com contagem, cria, recusa repetido, renomeia, remove com confirmação", async ({ page, request }) => {
  const slug = await seed(request, "Manual Dialogo Publicos");
  await page.goto(`/#/${slug}`);
  await expect(page.getByRole("button", { name: "Público da página: aluno" })).toBeVisible();

  await page.getByRole("button", { name: "Ajustes" }).click();
  await page.getByRole("menuitem", { name: "Públicos" }).click();
  const dialog = page.getByRole("dialog", { name: "Públicos do manual" });
  const row = (name: string) => dialog.getByRole("listitem").filter({ hasText: name });
  await expect(row("aluno")).toContainText("2 páginas");
  await expect(row("admin")).toContainText("1 página");

  // Criar sem página; repetido (ignorando maiúscula) é recusado junto ao campo.
  const add = dialog.getByRole("textbox", { name: "Novo público" });
  await add.fill("cliente");
  await add.press("Enter");
  await expect(row("cliente")).toContainText("0 páginas");
  await add.fill("ALUNO");
  await add.press("Enter");
  await expect(dialog.getByRole("alert")).toHaveText("Já existe um público chamado ALUNO.");
  await expect(add).toHaveAttribute("aria-invalid", "true");

  // Renomear: Esc cancela, repetido é recusado na linha, Enter grava e a página aberta acompanha.
  await dialog.getByRole("button", { name: "Renomear aluno" }).click();
  const edit = dialog.getByRole("textbox", { name: "Novo nome de aluno" });
  await edit.fill("outro");
  await edit.press("Escape");
  await expect(dialog).toBeVisible();
  await expect(row("aluno")).toBeVisible();
  await dialog.getByRole("button", { name: "Renomear aluno" }).click();
  await edit.fill("admin");
  await edit.press("Enter");
  await expect(dialog.getByRole("alert").filter({ hasText: "chamado admin" })).toBeVisible();
  await edit.fill("estudante");
  await edit.press("Enter");
  await expect(row("estudante")).toContainText("2 páginas");
  await expect
    .poll(() => audiencesOf(request, slug))
    .toMatchObject({
      audiences: ["aluno", "admin", "cliente"].map((a) => (a === "aluno" ? "estudante" : a)),
      pages: { Solo: ["estudante"], Duo: ["estudante", "admin"] },
    });

  // Remover com páginas: confirmação com a contagem e os títulos liberados; foco inicial em Cancelar.
  await dialog.getByRole("button", { name: "Remover estudante" }).click();
  const confirm = page.getByRole("dialog", { name: "Remover o público estudante?" });
  await expect(confirm).toContainText("2 páginas citam este público.");
  await expect(confirm).toContainText("Solo");
  await expect(confirm).not.toContainText("Duo");
  await expect(confirm.getByRole("button", { name: "Cancelar" })).toBeFocused();
  await confirm.getByRole("button", { name: "Cancelar" }).click();
  await expect(row("estudante")).toBeVisible();
  await dialog.getByRole("button", { name: "Remover estudante" }).click();
  await confirm.getByRole("button", { name: "Remover e liberar essas páginas" }).click();
  await expect(row("estudante")).toHaveCount(0);
  await expect
    .poll(() => audiencesOf(request, slug))
    .toMatchObject({
      audiences: ["admin", "cliente"],
      pages: { Duo: ["admin"] },
    });
  expect((await audiencesOf(request, slug)).pages.Solo).toBeUndefined();

  // Sem páginas: confirmação curta, um clique.
  await dialog.getByRole("button", { name: "Remover cliente" }).click();
  const last = page.getByRole("dialog", { name: "Remover o público cliente?" });
  await expect(last).toContainText("Nenhuma página usa.");
  await last.getByRole("button", { name: "Remover", exact: true }).click();
  await expect(row("cliente")).toHaveCount(0);

  // A página aberta (Solo) foi relida: o botão do popover mostra "Todos".
  // O Esc pode cair na confirmação que ainda está saindo: repete até o diálogo fechar.
  await expect(async () => {
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden({ timeout: 500 });
  }).toPass();
  await expect(page.getByRole("button", { name: "Público da página: Todos" })).toBeVisible();
});

test("públicos: o link do popover abre o diálogo; popover e diálogo sem violação de acessibilidade", async ({
  page,
  request,
}) => {
  const slug = await seed(request, "Manual Axe Publicos");
  await page.goto(`/#/${slug}`);
  await page.getByRole("button", { name: "Público da página: aluno" }).click();
  const popover = page.getByRole("dialog", { name: "Público da página" });
  await expect(popover).toBeVisible();
  expect(await grave(page)).toEqual([]);
  await popover.getByRole("button", { name: "Gerenciar públicos…" }).click();
  const dialog = page.getByRole("dialog", { name: "Públicos do manual" });
  await expect(dialog).toBeVisible();
  await expect(popover).toHaveCount(0);
  await dialog.getByRole("button", { name: "Renomear aluno" }).click();
  await dialog.getByRole("textbox", { name: "Novo nome de aluno" }).fill("admin");
  await dialog.getByRole("textbox", { name: "Novo nome de aluno" }).press("Enter");
  await expect(dialog.getByRole("alert")).toBeVisible();
  expect(await grave(page)).toEqual([]);
});
