/** Passeio guiado do primeiro uso (T-148): passos e regras de "visto", sem React. */
export const TOUR_KEY = "explicai:passeio";
/** Evento que o menu Ajustes dispara para reabrir o passeio. */
export const TOUR_EVENT = "explicai:passeio-abrir";

export interface TourStep {
  /** Valor de `data-passeio` ou seletor do elemento real; sem alvo na tela, o passo aparece centrado. */
  target: string;
  title: string;
  body: string;
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    target: '[data-passeio="nova-pagina"]',
    title: "Crie uma página",
    body: "Uma página por tela ou tarefa. Clique em Criar a primeira página para começar.",
  },
  {
    target: ".tiptap",
    title: "Cole um print",
    body: "Copie um print de fora e cole aqui com Ctrl+V. O Studio não captura a tela.",
  },
  {
    target: 'main [contenteditable="true"]',
    title: "Numere o que importa",
    body: "Clique no print, escolha Editar imagem e numere o que a pessoa precisa clicar. Escreva ao lado de cada número o que ele mostra.",
  },
  {
    target: '[data-passeio="exportar"]',
    title: "Exporte o manual",
    body: "Com o manual pronto, exporte em HTML ou PDF por este botão.",
  },
];

type Store = Pick<Storage, "getItem" | "setItem">;

export function isTourSeen(store: Store | null): boolean {
  try {
    return store?.getItem(TOUR_KEY) === "1";
  } catch {
    return false;
  }
}

export function markTourSeen(store: Store | null): void {
  try {
    store?.setItem(TOUR_KEY, "1");
  } catch {
    // Sem armazenamento: o passeio pode voltar na próxima visita.
  }
}

/** Abre sozinho só na primeira vez, e nunca sob automação (e2e), a não ser com ?passeio=1. */
export function shouldAutoOpen(opts: { seen: boolean; webdriver: boolean; search: string; emptyManual: boolean }): boolean {
  if (new URLSearchParams(opts.search).get("passeio") === "1") return true;
  // Quem já tem páginas já usa o Studio: não vê o passeio ao atualizar a versão.
  return !opts.seen && !opts.webdriver && opts.emptyManual;
}

/** Alvo alto (o editor) não cabe embaixo: o popover vai ao lado, dentro da janela. */
export function sideFor(target: Element | null, viewportHeight: number): "top" | "bottom" | "left" {
  if (!target) return "top";
  return target.getBoundingClientRect().height > viewportHeight * 0.5 ? "left" : "bottom";
}

/** Botão que abre a lista de páginas: o passo cuja barra lateral está fechada (375 px) aponta para ele. */
export const MENU_BUTTON = '[data-passeio="menu"]';

const visible = (el: Element | null): el is Element => {
  const r = el?.getBoundingClientRect();
  return !!r && r.width > 0 && r.height > 0;
};

/** Alvo visível; senão o botão do menu lateral; senão null (o passo cai no centro, sem cobrir o título). */
export function findTarget(step: TourStep, root: ParentNode = document): Element | null {
  const own = root.querySelector(step.target);
  if (visible(own)) return own;
  return [...root.querySelectorAll(MENU_BUTTON)].find(visible) ?? null;
}
