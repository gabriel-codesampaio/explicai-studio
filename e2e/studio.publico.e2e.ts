import { type APIRequestContext, expect, test } from "@playwright/test";

async function setup(request: APIRequestContext, title: string, pages: { title: string; body: string }[]) {
  const manual = await (await request.post("/api/manuals", { data: { title } })).json();
  const created: { id: string }[] = [];
  for (const p of pages) created.push(await (await request.post(`/api/manuals/${manual.slug}/pages`, { data: p })).json());
  return { slug: manual.slug as string, pages: created };
}

test("público: marca a página, vê como o perfil e exporta só o que ele vê", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Publico", [
    { title: "Geral", body: "Texto para todos." },
    { title: "Financeiro", body: "Texto secreto do admin." },
  ]);
  await page.goto(`/#/${slug}`);
  const tree = page.getByRole("navigation", { name: "Páginas do manual" });

  // Sem perfil no manual, nada de filtro na tela.
  await expect(tree.getByLabel("Visualizar como")).toHaveCount(0);

  await tree.getByRole("button", { name: "Financeiro", exact: true }).click();
  await page.getByRole("button", { name: /Público: Todos/ }).click();
  await page.getByRole("textbox", { name: "Novo público" }).fill("admin");
  await page.getByRole("button", { name: "Adicionar" }).click();
  await expect(page.getByRole("button", { name: "Público: admin" })).toBeVisible();
  await page.keyboard.press("Escape");

  // "Visualizar como" aparece e esconde a página de admin para outro perfil.
  await page.getByRole("button", { name: "Geral", exact: true }).click();
  await page.getByRole("button", { name: /Público: Todos/ }).click();
  await page.getByRole("textbox", { name: "Novo público" }).fill("cliente");
  await page.getByRole("button", { name: "Adicionar" }).click();
  await page.keyboard.press("Escape");
  await tree.getByRole("combobox", { name: "Visualizar como" }).click();
  await page.getByRole("option", { name: "admin" }).click();
  await expect(tree.getByRole("button", { name: "Financeiro", exact: true })).toBeVisible();
  await expect(tree.getByRole("button", { name: "Geral", exact: true })).toHaveCount(0);
  await tree.getByRole("combobox", { name: "Visualizar como" }).click();
  await page.getByRole("option", { name: "Todos" }).click();

  // Exportar para "cliente": só a página dele.
  await page.getByRole("button", { name: "Exportar manual" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Visualizar como" }).click();
  await page.getByRole("option", { name: "cliente" }).click();
  await dialog.getByText("Markdown para IA").click();
  await dialog.getByRole("button", { name: /^Exportar (HTML|PDF|Markdown)$/ }).click();
  const link = dialog.getByRole("link", { name: "Abrir o arquivo" });
  await expect(link).toBeVisible();
  const text = await (await request.get((await link.getAttribute("href")) ?? "")).text();
  expect(text).toContain("Texto para todos.");
  expect(text).not.toContain("secreto");
  expect(text).not.toContain("Financeiro");
});

// T-135: dois cliques seguidos, com a primeira gravação atrasada, não perdem nenhuma escolha.
test("público: duas trocas seguidas gravam na ordem e o menu mostra o que ficou", async ({ page, request }) => {
  const manual = await (await request.post("/api/manuals", { data: { title: "Manual Cliques" } })).json();
  const post = (data: object) => request.post(`/api/manuals/${manual.slug}/pages`, { data });
  await post({ title: "Fonte A", body: "a", audience: ["a"] });
  await post({ title: "Fonte B", body: "b", audience: ["b"] });
  await post({ title: "Alvo", body: "alvo" });
  let first = true;
  await page.route(/\/pages\/[^/]+$/, async (route) => {
    if (route.request().method() === "PUT" && first && route.request().postData()?.includes("audience")) {
      first = false;
      await new Promise((r) => setTimeout(r, 800)); // a primeira resposta chega depois da segunda escolha
    }
    await route.continue();
  });
  await page.goto(`/#/${manual.slug}`);
  await page.getByRole("navigation", { name: "Páginas do manual" }).getByRole("button", { name: "Alvo", exact: true }).click();
  await page.getByRole("button", { name: /Público: Todos/ }).click();
  await page.getByRole("checkbox", { name: "a", exact: true }).check();
  await page.getByRole("checkbox", { name: "b", exact: true }).check();
  await expect(page.getByRole("checkbox", { name: "a", exact: true })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "b", exact: true })).toBeChecked();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Público: a, b" })).toBeVisible({ timeout: 10_000 });
  const list = await (await request.get(`/api/manuals/${manual.slug}`)).json();
  const alvo = list.pages.find((p: { title: string }) => p.title === "Alvo");
  await expect
    .poll(async () => (await (await request.get(`/api/manuals/${manual.slug}/pages/${alvo.id}`)).json()).audience, {
      timeout: 10_000,
    })
    .toEqual(["a", "b"]);
});
