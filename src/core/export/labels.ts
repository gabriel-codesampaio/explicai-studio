/** Textos que o Explicaí escreve no manual exportado. Seguem o idioma do manual, não o da interface. */
export interface Labels {
  toc: string;
  pages: (n: number) => string;
  colophon: string;
  missingImage: string;
  goTo: string;
  legend: string;
  noDescription: string;
  hotspotUrl: (href: string) => string;
  hotspotPage: (title: string) => string;
  removedPage: string;
  untitled: string;
}

const PT: Labels = {
  toc: "Sumário",
  pages: (n) => `${n} ${n === 1 ? "página" : "páginas"}`,
  colophon: "Manual feito com o Explicaí Studio.",
  missingImage: "imagem não encontrada",
  goTo: "Ir para",
  legend: "Legenda da imagem",
  noDescription: "(sem descrição)",
  hotspotUrl: (href) => `Área clicável: leva a ${href}`,
  hotspotPage: (title) => `Área clicável: leva à página "${title}"`,
  removedPage: "removida",
  untitled: "Sem título",
};

const EN: Labels = {
  toc: "Contents",
  pages: (n) => `${n} ${n === 1 ? "page" : "pages"}`,
  colophon: "Manual made with Explicaí Studio.",
  missingImage: "image not found",
  goTo: "Go to",
  legend: "Image legend",
  noDescription: "(no description)",
  hotspotUrl: (href) => `Clickable area: goes to ${href}`,
  hotspotPage: (title) => `Clickable area: goes to the page "${title}"`,
  removedPage: "removed",
  untitled: "Untitled",
};

/** Manual em português (pt, pt-BR, pt-PT) recebe os textos em português; os outros, em inglês. */
export const labelsFor = (language: string): Labels => (language.toLowerCase().startsWith("pt") ? PT : EN);
