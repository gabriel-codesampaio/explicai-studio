export const MARGEM = 8;

/**
 * Área útil do editor: entre a barra fixa de cima e o rodapé, com margem. Medida ao abrir, porque
 * os dois são sticky e o rodapé muda de altura com o texto. Usada pelos balões e pelo menu "/".
 */
export function collisionPadding() {
  const bar = document.querySelector("[data-editor-toolbar]")?.getBoundingClientRect();
  const footer = document.querySelector("footer")?.getBoundingClientRect();
  return {
    top: Math.max(MARGEM, (bar?.bottom ?? 0) + MARGEM),
    bottom: Math.max(MARGEM, footer ? window.innerHeight - footer.top + MARGEM : 0),
    left: MARGEM,
    right: MARGEM,
  };
}
