import type { Page } from "@playwright/test";

type Pm = HTMLElement & {
  editor?: {
    state: { selection: { anchor: number; head: number } };
    view: { posAtDOM(node: Node, offset: number): number };
  };
};

/**
 * Espera o ProseMirror alcançar o que o navegador já fez com o texto e a seleção (digitação, clique, setas).
 * O ProseMirror só lê a seleção no selectionchange, depois do evento de teclado. Sob CPU disputada (CI) um Shift+Home
 * logo após digitar era desfeito por uma transação que ainda trazia o cursor antigo, e o Ctrl+E/Ctrl+K agia numa
 * seleção velha. Chame depois de digitar, clicar ou mover a seleção, e antes do próximo passo que dependa dela.
 */
export async function settleEditor(page: Page) {
  await page.waitForFunction(() => {
    const ed = (document.querySelector(".ProseMirror") as Pm | null)?.editor;
    const dom = getSelection();
    if (!ed || !dom?.anchorNode || !dom.focusNode) return true;
    try {
      return (
        ed.view.posAtDOM(dom.anchorNode, dom.anchorOffset) === ed.state.selection.anchor &&
        ed.view.posAtDOM(dom.focusNode, dom.focusOffset) === ed.state.selection.head
      );
    } catch {
      return true; // seleção fora do editor
    }
  });
}
