import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

// T-560: janela meio-tela (960 px). Sem rolagem horizontal na página nem nos diálogos, claro e escuro.
const IMAGE = path.join(import.meta.dirname, "fixtures", "tela.png");

/** Nada passa da largura da janela: nem a página, nem o diálogo aberto, nem um filho dele. */
async function semTransbordo(page: Page) {
  const bad = await page.evaluate(() => {
    const w = innerWidth;
    const out: string[] = [];
    if (document.documentElement.scrollWidth > w) out.push(`html ${document.documentElement.scrollWidth}`);
    for (const d of document.querySelectorAll('[role="dialog"]')) {
      const box = d as HTMLElement;
      if (box.scrollWidth > box.clientWidth)
        out.push(`dialog ${box.getAttribute("aria-label") ?? ""} ${box.scrollWidth}>${box.clientWidth}`);
      for (const el of box.querySelectorAll<HTMLElement>("*")) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > w + 1 || r.left < -1))
          out.push(`${el.tagName}.${String(el.className).slice(0, 40)} ${Math.round(r.left)}..${Math.round(r.right)}`);
      }
    }
    return out.slice(0, 8);
  });
  expect(bad).toEqual([]);
}

for (const theme of ["light", "dark"] as const) {
  test(`960 px (${theme}): página, Exportar, Versões, Ajustes e editor de imagem sem transbordo`, async ({ page, request }) => {
    const manual = await (await request.post("/api/manuals", { data: { title: `Manual 960 ${theme}` } })).json();
    const url = `/api/manuals/${manual.slug}/pages`;
    const body = "| Coluna A | Coluna B | Coluna C | Coluna D |\n| --- | --- | --- | --- |\n| a | b | c | d |\n\nTexto.";
    const created = await (await request.post(url, { data: { title: "Cadastro de cliente com nome longo", body } })).json();
    await request.post(`${url}/${created.id}/versions`, { data: { note: "Aprovada" } });
    await page.setViewportSize({ width: 960, height: 720 });
    await page.addInitScript((mode) => {
      if (!sessionStorage.getItem("semeado")) {
        localStorage.setItem("explicai:aparencia", JSON.stringify({ mode }));
        sessionStorage.setItem("semeado", "1");
      }
    }, theme);
    await page.goto(`/#/${manual.slug}/${created.id}`);
    await expect(page.getByRole("textbox", { name: "Conteúdo da página" })).toBeVisible();
    await semTransbordo(page);

    await page.getByRole("button", { name: "Exportar manual" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await semTransbordo(page);
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: /^Versões/ }).click();
    await expect(page.getByRole("dialog", { name: "Versões desta página" })).toBeVisible();
    await semTransbordo(page);
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Ajustes" }).click();
    await page.getByRole("menuitem", { name: "Aparência do manual" }).click();
    await expect(page.getByRole("dialog", { name: "Aparência do manual" })).toBeVisible();
    await semTransbordo(page);
    await page.keyboard.press("Escape");

    const editor = page.getByRole("textbox", { name: "Conteúdo da página" });
    await editor.click();
    await page.locator('input[type="file"]').setInputFiles(IMAGE);
    await editor.getByRole("img", { name: "tela" }).click();
    await page.getByRole("button", { name: "Editar imagem" }).click();
    await expect(page.getByRole("dialog", { name: "Editar imagem" })).toBeVisible();
    await semTransbordo(page);
  });
}
