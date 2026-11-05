/**
 * O Radix esconde o fundo com aria-hidden quando um menu ou diálogo abre, mas o fundo continua focável
 * (axe 4.1.2, aria-hidden-focus). Marca o mesmo fundo como inert enquanto o aria-hidden dele existir.
 */
export function inertWhenHidden(): void {
  const sync = (el: Element) => {
    if (el.hasAttribute("data-aria-hidden")) el.setAttribute("inert", "");
    else el.removeAttribute("inert");
  };
  new MutationObserver((records) => {
    for (const r of records) sync(r.target as Element);
  }).observe(document.body, { attributes: true, attributeFilter: ["data-aria-hidden"], subtree: true });
}
