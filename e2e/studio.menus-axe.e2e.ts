import { readFileSync } from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

// T-173 (fundo aria-hidden dos menus Radix sem foco), T-263 (busca e menu "/").
test("menus abertos: axe sem aria-hidden-focus e Tab não sai do menu", async ({ page, request }) => {
  const m = await (await request.post("/api/manuals", { data: { title: "Menus", language: "pt-BR" } })).json();
  const p = await (await request.post(`/api/manuals/${m.slug}/pages`, { data: { title: "Início" } })).json();
  await page.goto(`/#/${m.slug}/${p.id}`);
  const abrir = [
    () => page.getByRole("button", { name: "Ajustes" }).click(),
    () => page.getByRole("button", { name: /Status da página/ }).click(),
    () =>
      page
        .getByRole("button", { name: /Mais ações para/ })
        .first()
        .click({ force: true }),
  ];
  for (const open of abrir) {
    await open();
    await expect(page.getByRole("menu")).toBeVisible();
    const r = await new AxeBuilder({ page }).withRules(["aria-hidden-focus"]).analyze();
    expect(r.violations).toEqual([]);
    for (const key of ["Tab", "Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab"]) {
      await page.keyboard.press(key);
      expect(await page.evaluate(() => !!document.activeElement?.closest("[role=menu]"))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toBeHidden();
  }
});

test("busca (Ctrl+P) e menu / sem violação do axe, vazios e com resultado", async ({ page, request }) => {
  const m = await (await request.post("/api/manuals", { data: { title: "Busca", language: "pt-BR" } })).json();
  const p = await (await request.post(`/api/manuals/${m.slug}/pages`, { data: { title: "Configurar acesso" } })).json();
  await page.goto(`/#/${m.slug}/${p.id}`);
  const editor = page.getByRole("textbox", { name: "Conteúdo da página" });
  await expect(editor).toBeVisible();
  // Com o diálogo aberto o <main> fica inert (fundo); o axe estranha a rolagem dele sem foco, o que não vale para o fundo.
  const clean = async (fundo = false) => {
    const axe = new AxeBuilder({ page });
    expect((await (fundo ? axe.exclude("#conteudo") : axe).analyze()).violations).toEqual([]);
  };

  await page.keyboard.press("Control+p");
  await expect(page.getByRole("dialog")).toBeVisible();
  await clean(true);
  await page.keyboard.type("conf");
  await expect(page.getByRole("option")).toHaveCount(1);
  await clean(true);
  await page.keyboard.press("Control+a");
  await page.keyboard.type("zzzzqq");
  await expect(page.getByRole("option")).toHaveCount(0);
  await clean(true);
  await page.keyboard.press("Escape");

  await editor.click();
  await page.keyboard.type("/");
  await expect(page.getByRole("listbox")).toBeVisible();
  await clean();
  await page.keyboard.type("zzzzqq");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await clean();
});

// T-204: auditoria de a11y da 1.0. Cada tela e diálogo, nos dois temas: axe (WCAG 2.2 AA, com contraste),
// alvos >= 24 px (WCAG 2.5.8) e foco visível. Com diálogo aberto o <main> fica inert, então sai da conta.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const PNG = readFileSync(path.join(import.meta.dirname, "fixtures", "tela.png"));

async function audit(page: Page, onde: string) {
  await page.mouse.move(0, 0); // sem hover em transição de cor falseando o contraste
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
  const dialog = (await page.getByRole("dialog").count()) > 0;
  const axe = new AxeBuilder({ page }).withTags(TAGS);
  const r = await (dialog ? axe.exclude("#conteudo") : axe).analyze();
  expect(r.violations.map((v) => `${onde}: ${v.id} ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  // Alvos de toque: botões, links e campos visíveis e não inertes (texto em linha de parágrafo é isento).
  const pequenos = await page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLElement>(
        "button, [role=button], [role=menuitem], [role=tab], input:not([type=hidden]), select, a[href]",
      ),
    ]
      .filter(
        (el) =>
          el.getAttribute("href") !== "#conteudo" &&
          !el.closest("[inert], [aria-hidden=true]") &&
          !el.closest(".ProseMirror p, .ProseMirror li"),
      )
      // Campo dentro de <label> vale pelo rótulo inteiro; botão no meio de uma frase é isento (WCAG 2.5.8, "inline").
      .filter(
        (el) =>
          !(
            el.tagName === "BUTTON" &&
            el.parentElement &&
            (el.parentElement.textContent?.length ?? 0) > (el.textContent?.length ?? 0) + 15
          ),
      )
      .map((el) => ({ el, r: (el.closest("label") ?? el).getBoundingClientRect() }))
      .filter(({ el, r }) => r.width > 1 && r.height > 1 && getComputedStyle(el).visibility !== "hidden")
      .filter(({ r }) => r.width < 24 || r.height < 24)
      .map(
        ({ el, r }) =>
          `${el.tagName.toLowerCase()}[${el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 20)}] ${Math.round(r.width)}x${Math.round(r.height)}`,
      ),
  );
  expect(pequenos, `${onde}: alvos < 24 px`).toEqual([]);
}

/** Tab até voltar ao começo: o foco sempre anda, nunca fica preso e é visível em cada parada. */
async function tabCompleto(page: Page, onde: string, dentro?: string) {
  const vistos: string[] = [];
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press("Tab");
    const s = await page.evaluate(async (escopo) => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      await Promise.all(el.getAnimations().map((a) => a.finished.catch(() => undefined))); // espera a transição de cor
      const cs = getComputedStyle(el);
      const visivel =
        cs.outlineStyle !== "none" ||
        cs.boxShadow !== "none" ||
        el.matches(".ProseMirror") ||
        (el.tagName === "TEXTAREA" && cs.borderBottomColor !== "rgba(0, 0, 0, 0)"); // título: sublinhado na cor primária
      return {
        id: `${el.tagName}:${el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 24) ?? ""}`,
        visivel,
        dentro: escopo ? !!el.closest(escopo) : true,
      };
    }, dentro);
    if (!s) {
      expect(dentro, `${onde}: foco saiu do diálogo`).toBeUndefined();
      break;
    } // sem diálogo: saiu da página, ciclo fechou
    expect(s.dentro, `${onde}: foco saiu de ${dentro}`).toBe(true);
    expect(s.visivel, `${onde}: foco invisível em ${s.id}`).toBe(true);
    if (vistos[0] === s.id && vistos.length > 1) break; // voltou ao primeiro: diálogo em ciclo
    vistos.push(s.id);
  }
  expect(vistos.length, `${onde}: Tab não chegou a nada`).toBeGreaterThan(0);
  expect(vistos.length, `${onde}: Tab sem fim (armadilha?)`).toBeLessThan(80);
}

for (const scheme of ["light", "dark"] as const) {
  test(`auditoria 1.0 (${scheme}): sidebar, diálogos, passeio e telas de erro sem violação`, async ({ page, request }) => {
    test.setTimeout(90_000);
    await page.emulateMedia({ colorScheme: scheme });
    const m = await (await request.post("/api/manuals", { data: { title: `Auditoria ${scheme}`, language: "pt-BR" } })).json();
    const post = (data: object) => request.post(`/api/manuals/${m.slug}/pages`, { data });
    await post({ title: "Solo", body: "a", audience: ["aluno"] });
    const p = await (
      await post({ title: "Tela", body: "Antes.\n\n![Tela](../assets/tela.png)\n\nDepois.", audience: ["aluno", "admin"] })
    ).json();
    const filho = await (await post({ title: "Filho", body: "x" })).json();
    await request.post(`/api/manuals/${m.slug}/assets?name=tela.png`, { data: PNG });
    await request.delete(`/api/manuals/${m.slug}/pages/${filho.id}`);
    await page.goto(`/#/${m.slug}/${p.id}`);
    await expect(page.getByRole("textbox", { name: "Conteúdo da página" })).toBeVisible();
    await expect(page.locator(".node-image img")).toBeVisible();

    await audit(page, "sidebar+editor");
    await tabCompleto(page, "página");

    const abrirAjustes = async (item: string) => {
      await page.getByRole("button", { name: "Ajustes" }).click();
      await page.getByRole("menuitem", { name: item }).click();
    };
    const telas: [string, () => Promise<unknown>, string][] = [
      ["Exportar", () => page.getByRole("button", { name: "Exportar manual" }).click(), "Exportar manual"],
      ["Aparência", () => abrirAjustes("Aparência do manual"), "Aparência do manual"],
      ["Públicos", () => abrirAjustes("Públicos"), "Públicos do manual"],
      ["Versões", () => page.getByRole("button", { name: /^Versões/ }).click(), "Versões desta página"],
      ["Lixeira", () => page.getByRole("button", { name: "Lixeira", exact: true }).click(), "Lixeira deste manual"],
      ["Ajuda", () => page.getByRole("button", { name: "Ajuda", exact: true }).click(), "Ajuda"],
      ["Tema", () => abrirAjustes("Tema do Studio"), "Tema do Studio"],
      ["Idioma", () => abrirAjustes("Idioma"), "Idioma"],
      [
        "Marcação",
        async () => {
          await page.locator(".node-image img").click();
          await page.getByRole("button", { name: "Editar imagem" }).click();
        },
        "Editar imagem",
      ],
    ];
    for (const [nome, abrir, titulo] of telas) {
      await abrir();
      const dialog = page.getByRole("dialog", { name: titulo });
      await expect(dialog).toBeVisible();
      await audit(page, nome);
      await tabCompleto(page, nome, "[role=dialog]");
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }

    await page.goto(`/?passeio=1#/${m.slug}/${p.id}`);
    await expect(page.getByRole("dialog", { name: "Crie uma página" })).toBeVisible();
    await audit(page, "passeio 1");
    await page.getByRole("button", { name: "Próximo" }).click();
    await expect(page.getByRole("dialog", { name: "Cole um print" })).toBeVisible();
    await audit(page, "passeio 2");
    await page.keyboard.press("Escape");

    await page.goto(`/#/${m.slug}/pagina-antiga`);
    await expect(page.getByRole("heading", { name: "Não achamos esta página" })).toBeVisible();
    await audit(page, "404 página");
    await page.goto("/#/manual-sumido");
    await expect(page.getByRole("heading", { name: "Não achamos este manual" })).toBeVisible();
    await audit(page, "404 manual");

    await page.route("**/api/**", (route) => route.abort("connectionrefused"));
    await page.goto(`/?fora=1#/${m.slug}`); // a query nova força carga completa
    await expect(page.getByRole("heading", { name: "O Studio não está respondendo" })).toBeVisible();
    await audit(page, "servidor fora");
  });
}
