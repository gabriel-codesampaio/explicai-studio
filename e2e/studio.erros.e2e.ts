// Roda depois de studio.e2e.ts, cujo primeiro teste espera a pasta de manuais vazia.
import { type APIRequestContext, expect, test } from "@playwright/test";

async function setup(request: APIRequestContext, title: string, pages: string[] = []) {
  const manual = await (await request.post("/api/manuals", { data: { title } })).json();
  const created: { id: string; title: string }[] = [];
  for (const t of pages)
    created.push(await (await request.post(`/api/manuals/${manual.slug}/pages`, { data: { title: t } })).json());
  return { slug: manual.slug as string, pages: created };
}

test("link para página que não existe abre a tela 404 e leva à primeira página", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual 404", ["Primeira"]);
  await page.goto(`/#/${slug}/pagina-antiga`);
  const heading = page.getByRole("heading", { name: "Não achamos esta página" });
  await expect(heading).toBeFocused();
  await expect(page.getByText(`404 #/${slug}/pagina-antiga`)).toBeVisible();
  await page.getByRole("button", { name: "Abrir a primeira página" }).click();
  await expect(page.getByRole("textbox", { name: "Título da página" })).toHaveValue("Primeira");
  await expect(heading).toHaveCount(0);
});

test("link para manual que não existe abre a tela 404 e o hash novo vale na mesma aba", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Existe", ["Uma"]);
  await page.goto("/#/manual-sumido");
  await expect(page.getByRole("heading", { name: "Não achamos este manual" })).toBeFocused();
  await page.evaluate((s) => {
    window.location.hash = `#/${s}`;
  }, slug);
  await expect(page.getByRole("textbox", { name: "Título da página" })).toHaveValue("Uma");
});

for (const mode of ["abort", "502"] as const) {
  test(`servidor fora na abertura (${mode}): tela com reconexão automática, abre sozinha quando volta`, async ({
    page,
    request,
  }) => {
    const { slug } = await setup(request, `Manual Fora ${mode}`, ["Pagina"]);
    let down = true;
    await page.route("**/api/**", (route) => {
      if (!down) return route.continue();
      return mode === "abort"
        ? route.abort("connectionrefused")
        : route.fulfill({ status: 502, contentType: "text/plain", body: "" });
    });
    await page.goto(`/#/${slug}`);
    await expect(page.getByRole("heading", { name: "O Studio não está respondendo" })).toBeFocused();
    await expect(page.getByText(mode === "502" ? "HTTP 502" : "fetch failed")).toBeVisible();
    down = false;
    // Primeira tentativa em 1 s: sem clicar em nada o Studio abre.
    await expect(page.getByRole("textbox", { name: "Título da página" })).toHaveValue("Pagina", { timeout: 8000 });
  });
}

test("Tentar agora antecipa a reconexão", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Agora", ["Pagina"]);
  let down = true;
  await page.route("**/api/**", (route) => (down ? route.abort("connectionrefused") : route.continue()));
  await page.goto(`/#/${slug}`);
  await expect(page.getByRole("heading", { name: "O Studio não está respondendo" })).toBeVisible();
  down = false;
  await page.getByRole("button", { name: "Tentar agora" }).click();
  await expect(page.getByRole("textbox", { name: "Título da página" })).toHaveValue("Pagina", { timeout: 3000 });
});

test("servidor cai com o Studio aberto: aviso no topo, texto continua e salva sozinho na volta", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Caiu", ["Pagina"]);
  await page.goto(`/#/${slug}`);
  const editor = page.getByRole("textbox", { name: "Conteúdo da página" });
  await expect(editor).toBeVisible();
  let down = true;
  await page.route("**/api/**", (route) => (down ? route.abort("connectionrefused") : route.continue()));
  await editor.click();
  await page.keyboard.type("Texto digitado sem servidor.");
  const banner = page.getByRole("alert").filter({ hasText: "Sem conexão com o Studio." });
  await expect(banner).toBeVisible();
  // Sem faixa colorida na lateral: o aviso se destaca pelo ícone, pelo texto e pela borda de baixo.
  await expect(banner).toHaveCSS("border-left-width", "0px");
  await expect(page.getByText("Não foi possível salvar. O texto continua na tela.")).toBeVisible();
  await expect(editor).toContainText("Texto digitado sem servidor.");
  down = false;
  await expect(page.getByRole("status").filter({ hasText: "Salvo às" })).toBeVisible({ timeout: 8000 });
  await expect(page.getByText("Sem conexão com o Studio.")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Conteúdo da página" })).toContainText("Texto digitado sem servidor.");
});

test("erro de renderização: tela de erro com recarregar e código copiável, sem tela em branco", async ({ page, request }) => {
  const { slug, pages } = await setup(request, "Manual Quebra", ["Boa", "Ruim"]);
  const ruim = pages[1];
  await page.route(`**/api/manuals/${slug}/pages/${ruim?.id}`, (route) =>
    route.request().method() === "GET"
      ? route.fulfill({ json: { id: ruim?.id, title: "Ruim", status: "rascunho", file: "x.md", body: { quebrado: true } } })
      : route.continue(),
  );
  await page.goto(`/#/${slug}`);
  await page.getByRole("button", { name: "Ruim", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Algo quebrou nesta tela" })).toBeFocused();
  await expect(page.getByRole("button", { name: "Recarregar o Studio" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copiar código" })).toBeVisible();
  // A árvore continua de pé e outra página abre sem recarregar.
  await page.getByRole("navigation", { name: "Páginas do manual" }).getByRole("button", { name: "Boa", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Título da página" })).toHaveValue("Boa");
});

test("servidor recusa o acesso (403): página inteira com marca, texto e código", async ({ page }) => {
  await page.route("**/api/manuals", (route) =>
    route.fulfill({
      status: 403,
      json: { error: "Host não permitido.", code: "forbidden-host" },
    }),
  );
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "O Studio só abre neste computador" })).toBeFocused();
  await expect(page.getByRole("img", { name: "Explicaí Studio" })).toBeVisible();
  await expect(page.getByText("HTTP 403 forbidden-host")).toBeVisible();
  await expect(page.locator("mark")).toHaveText("neste computador");
});

test("servidor responde 500: página inteira com tentar de novo, que abre o Studio quando o servidor volta", async ({
  page,
  request,
}) => {
  const { slug } = await setup(request, "Manual Quinhentos", ["Pagina"]);
  let broken = true;
  await page.route("**/api/manuals", (route) =>
    broken ? route.fulfill({ status: 500, json: { error: "Falhou ao ler a pasta." } }) : route.continue(),
  );
  await page.goto(`/#/${slug}`);
  await expect(page.getByRole("heading", { name: "O servidor não conseguiu responder" })).toBeFocused();
  await expect(page.getByText("HTTP 500")).toBeVisible();
  broken = false;
  await page.getByRole("button", { name: "Tentar de novo" }).click();
  await expect(page.getByRole("textbox", { name: "Título da página" })).toHaveValue("Pagina");
});

test("404 abre em página inteira com a marca e cabe em 375 px sem rolagem lateral", async ({ page, request }) => {
  const { slug } = await setup(request, "Manual Celular", ["Primeira"]);
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto(`/#/${slug}/antiga`);
  await expect(page.getByRole("heading", { name: "Não achamos esta página" })).toBeFocused();
  await expect(page.getByRole("img", { name: "Explicaí Studio" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
