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
    body: "Uma página por tela ou tarefa. Clique em Nova página para começar.",
  },
  {
    target: 'main [contenteditable="true"]',
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
export function shouldAutoOpen(opts: { seen: boolean; webdriver: boolean; search: string }): boolean {
  if (new URLSearchParams(opts.search).get("passeio") === "1") return true;
  return !opts.seen && !opts.webdriver;
}

/** Elemento-alvo visível, ou null (menu fechado, tela estreita): o passo cai no centro da tela. */
export function findTarget(step: TourStep, root: ParentNode = document): Element | null {
  const el = root.querySelector(step.target);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? el : null;
}
