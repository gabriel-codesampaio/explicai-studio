/** Textos que o Explicaí escreve no manual exportado. Seguem o idioma do manual, não o da interface. */
export interface Labels {
  toc: string;
  pages: (n: number) => string;
  colophon: string;
  missingImage: string;
  goTo: string;
  legend: string;
  hotspotUrl: (href: string) => string;
  hotspotPage: (title: string) => string;
  removedPage: string;
  untitled: string;
  callouts: Record<string, string>;
  pageNav: string;
  prev: string;
  next: string;
  backToToc: string;
  openOriginal: string;
  start: string;
  readTime: (pages: number, minutes: number) => string;
  search: string;
  /** `{n}` vira a contagem de páginas com o termo. */
  searchResults: { zero: string; one: string; many: string };
}

const PT: Labels = {
  toc: "Sumário",
  pages: (n) => `${n} ${n === 1 ? "página" : "páginas"}`,
  colophon: "Manual feito com o Explicaí Studio.",
  missingImage: "imagem não encontrada",
  goTo: "Ir para",
  legend: "Legenda da imagem",
  hotspotUrl: (href) => `Área clicável: leva a ${href}`,
  hotspotPage: (title) => `Área clicável: leva à página "${title}"`,
  removedPage: "removida",
  untitled: "Sem título",
  callouts: { tip: "Dica", warning: "Atenção", caution: "Erro", note: "Nota" },
  pageNav: "Entre as páginas",
  prev: "Anterior",
  next: "Próxima",
  backToToc: "Voltar ao sumário",
  openOriginal: "Abrir a imagem no tamanho original",
  start: "Comece por",
  readTime: (n, min) => `${n} ${n === 1 ? "página" : "páginas"}, cerca de ${min} min de leitura`,
  search: "Buscar no manual",
  searchResults: { zero: "Nenhuma página com esse termo", one: "1 página com esse termo", many: "{n} páginas com esse termo" },
};

const EN: Labels = {
  toc: "Contents",
  pages: (n) => `${n} ${n === 1 ? "page" : "pages"}`,
  colophon: "Manual made with Explicaí Studio.",
  missingImage: "image not found",
  goTo: "Go to",
  legend: "Image legend",
  hotspotUrl: (href) => `Clickable area: goes to ${href}`,
  hotspotPage: (title) => `Clickable area: goes to the page "${title}"`,
  removedPage: "removed",
  untitled: "Untitled",
  callouts: { tip: "Tip", warning: "Warning", caution: "Error", note: "Note" },
  pageNav: "Between pages",
  prev: "Previous",
  next: "Next",
  backToToc: "Back to contents",
  openOriginal: "Open the image at full size",
  start: "Start with",
  readTime: (n, min) => `${n} ${n === 1 ? "page" : "pages"}, about ${min} min to read`,
  search: "Search the manual",
  searchResults: { zero: "No pages with this term", one: "1 page with this term", many: "{n} pages with this term" },
};

/** Manual em português (pt, pt-BR, pt-PT) recebe os textos em português; os outros, em inglês. */
export const labelsFor = (language: string): Labels => (language.toLowerCase().startsWith("pt") ? PT : EN);
