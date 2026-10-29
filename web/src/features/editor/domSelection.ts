import type { Editor } from "@tiptap/react";

/**
 * Traz para o editor a seleção que está no navegador. Logo depois de um Shift+Home, o ProseMirror
 * ainda pode não ter lido a seleção nova; um Ctrl+K nesse instante abria o link com a seleção vazia.
 */
export function syncSelectionFromDom(editor: Editor): void {
  const dom = window.getSelection();
  const { view } = editor;
  if (!dom?.anchorNode || !dom.focusNode || !view.dom.contains(dom.anchorNode) || !view.dom.contains(dom.focusNode)) return;
  const anchor = view.posAtDOM(dom.anchorNode, dom.anchorOffset);
  const head = view.posAtDOM(dom.focusNode, dom.focusOffset);
  if (anchor !== head) editor.commands.setTextSelection({ from: Math.min(anchor, head), to: Math.max(anchor, head) });
}
