import { expect, test } from "@playwright/test";

// Tela dividida (~960 px): a árvore fica numa coluna estreita; só abaixo de 900 px vira gaveta.
for (const scheme of ["light", "dark"] as const) {
  for (const [width, tree] of [
    [375, false],
    [899, false],
    [900, true],
    [960, true],
    [1023, true],
    [1440, true],
  ] as const) {
    test(`${width} px (${scheme}): sem rolagem horizontal, árvore ${tree ? "visível" : "na gaveta"}, marca no topo ou na coluna`, async ({
      page,
      request,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width, height: 800 });
      const manual = await (await request.post("/api/manuals", { data: { title: `Manual Dividida ${width}` } })).json();
      await request.post(`/api/manuals/${manual.slug}/pages`, { data: { title: "Início" } });
      await page.goto(`/#/${manual.slug}`);

      const nav = page.getByRole("navigation", { name: "Páginas do manual" });
      const brand = page.getByRole("img", { name: "Explicaí Studio" }).locator("visible=true");
      await expect(brand).toHaveCount(1);
      if (tree) {
        await expect(nav).toBeVisible();
        const box = await page.locator("aside").boundingBox();
        expect(box?.width).toBe(width < 1024 ? 224 : 280);
      } else {
        await expect(nav).toHaveCount(0);
        await page.getByRole("button", { name: /Mostrar as páginas/ }).click();
        await expect(nav).toBeVisible();
      }
      const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth }));
      expect(widths.scroll).toBeLessThanOrEqual(widths.inner);
      // A coluna estreita não pode cortar o botão de recolher.
      if (tree) {
        const aside = await page.locator("aside").boundingBox();
        const close = await page.getByRole("button", { name: /Esconder as páginas/ }).boundingBox();
        expect((close?.x ?? 0) + (close?.width ?? 0)).toBeLessThanOrEqual((aside?.x ?? 0) + (aside?.width ?? 0));
      }
    });
  }
}
