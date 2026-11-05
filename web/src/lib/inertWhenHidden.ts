/**
 * O Radix esconde o fundo com aria-hidden quando um menu ou diálogo abre, mas o fundo continua focável
 * (axe 4.1.2, aria-hidden-focus). Marca o mesmo fundo como inert enquanto o aria-hidden dele existir.
 *
 * Ao fechar, o Radix devolve o foco ao gatilho só depois da animação de saída, e o aria-hidden do fundo
 * ainda existe nesse momento: focus() num elemento inert não faz nada. Por isso o inert sai assim que o
 * overlay fecha (data-state="closed") e volta a seguir o aria-hidden no próximo focusin (foco devolvido ao gatilho ou levado a outro overlay).
 */

export function inertWhenHidden(): void {
  const sync = (el: Element) => {
    // inert em quem tem o foco o tira dali: o gatilho que acabou de receber o foco fica de fora.
    if (el.hasAttribute("data-aria-hidden")) {
      if (!el.contains(document.activeElement)) el.setAttribute("inert", "");
    } else el.removeAttribute("inert");
  };
  const syncAll = () => document.querySelectorAll("[inert], [data-aria-hidden]").forEach(sync);
  new MutationObserver((records) => {
    let closing = false;
    for (const r of records) {
      if (r.attributeName === "data-state") {
        const t = r.target as Element;
        if (t.getAttribute("data-state") === "closed" && t.matches('[role="dialog"], [role="menu"]')) closing = true;
      } else sync(r.target as Element);
    }
    if (closing) {
      document.querySelectorAll("[inert]").forEach((el) => {
        el.removeAttribute("inert");
      });
      document.addEventListener("focusin", syncAll, { once: true });
    }
  }).observe(document.body, {
    attributes: true,
    attributeFilter: ["data-aria-hidden", "data-state"],
    subtree: true,
  });
}
