import { expect, test } from "@playwright/test";

// T-568: fechar um diálogo (Esc ou Fechar) devolve o foco ao gatilho, nunca a "Pular para o conteúdo".
test("diálogos do Studio devolvem o foco ao gatilho com Esc e com Fechar", async ({ page, request }) => {
  const manual = await (await request.post("/api/manuals", { data: { title: "Foco" } })).json();
  await request.post(`/api/manuals/${manual.slug}/pages`, { data: { title: "Início" } });
  await page.goto(`/#/${manual.slug}`);
  await page.getByRole("button", { name: "Início" }).first().click();
  const more = page.getByRole("button", { name: "Ajustes" });

  const casos: [string, () => Promise<void>, string, () => ReturnType<typeof page.locator>][] = [
    [
      "Aparência (menu)",
      async () => {
        await more.click();
        await page.getByRole("menuitem", { name: "Aparência do manual" }).click();
      },
      "Aparência do manual",
      () => more,
    ],
    [
      "Públicos (menu)",
      async () => {
        await more.click();
        await page.getByRole("menuitem", { name: "Públicos" }).click();
      },
      "Públicos do manual",
      () => more,
    ],
    [
      "Exportar",
      () => page.getByRole("button", { name: "Exportar manual" }).click(),
      "Exportar manual",
      () => page.getByRole("button", { name: "Exportar manual" }),
    ],
    [
      "Versões",
      () => page.getByRole("button", { name: /^Versões/ }).click(),
      "Versões desta página",
      () => page.getByRole("button", { name: /^Versões/ }),
    ],
    [
      "Capa e rodapé",
      () => page.getByRole("button", { name: "Editar a capa e o rodapé do manual" }).click(),
      "Aparência do manual",
      () => page.getByRole("button", { name: "Editar a capa e o rodapé do manual" }),
    ],
  ];

  for (const [nome, abrir, titulo, gatilho] of casos) {
    for (const fechar of ["Esc", "Fechar"]) {
      await abrir();
      const dialog = page.getByRole("dialog", { name: titulo });
      await expect(dialog, `${nome}: abre`).toBeVisible();
      if (fechar === "Esc") await page.keyboard.press("Escape");
      else await dialog.getByRole("button", { name: "Fechar", exact: true }).click();
      await expect(page.getByRole("dialog"), `${nome}: fecha com ${fechar}`).toHaveCount(0);
      await expect(gatilho(), `${nome}: foco volta ao gatilho com ${fechar}`).toBeFocused();
    }
  }
});
