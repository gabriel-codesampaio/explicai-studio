import { expect, test } from "@playwright/test";

const probe = () => {
  const el = document.querySelector(".ProseMirror") as HTMLElement & { editor?: { state: { selection: { from: number; to: number } }; view: { hasFocus(): boolean } } };
  const s = window.getSelection();
  return JSON.stringify({
    dom: s ? [s.anchorOffset, s.focusOffset, String(s).length] : null,
    pm: el.editor ? [el.editor.state.selection.from, el.editor.state.selection.to] : null,
    viewFocus: el.editor?.view.hasFocus(),
    docFocus: document.hasFocus(),
    active: document.activeElement?.className?.toString().slice(0, 20),
    menu: !!document.querySelector('[aria-label="Formatar seleção"]'),
  });
};

for (let i = 0; i < 12; i++) {
  test(`diag shift+home ${i}`, async ({ page, request }) => {
    const m = await (await request.post("/api/manuals", { data: { title: `Diag ${i}` } })).json();
    const p = await (await request.post(`/api/manuals/${m.slug}/pages`, { data: { title: "Início", body: "" } })).json();
    await page.goto(`/#/${m.slug}/${p.id}`);
    const ed = page.getByRole("textbox", { name: "Conteúdo da página" });
    await expect(ed).toBeVisible();
    await ed.click();
    await page.keyboard.type("Clique em Excluir");
    await page.keyboard.press("Shift+Home");
    const log: string[] = [];
    const t0 = Date.now();
    for (let k = 0; k < 8; k++) {
      log.push(`${Date.now() - t0}ms ${await page.evaluate(probe)}`);
      await page.waitForTimeout(100);
    }
    console.log(`#${i}\n` + log.join("\n"));
  });
}
