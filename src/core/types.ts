/** Formato em disco de um manual. Ver docs/manual-format.md. */

export const FORMAT_VERSION = 1;

/** Nó da árvore de páginas guardada em manual.json. O título fica só no frontmatter da página. */
export interface PageNode {
  id: string;
  /** Caminho relativo à pasta do manual, sempre em `pages/`. */
  file: string;
  /** Versão escolhida para o manual final (arquivo em `.versoes/<id>/`). Sem ela, vale o texto atual. */
  published?: string;
  children: PageNode[];
}

export interface ManualMeta {
  version: typeof FORMAT_VERSION;
  title: string;
  /** Tag BCP 47, como `pt-BR` ou `en-US`. */
  language: string;
  /** Aparência do manual exportado. Sem ela, vale a cor da marca. */
  theme?: ManualTheme;
  pages: PageNode[];
}

/** Onde o manual exportado tem título: a capa, o título da página e os níveis 1 a 3 do editor. */
export const HEADING_SLOTS = ["cover", "page", "h1", "h2", "h3"] as const;
export type HeadingSlot = (typeof HEADING_SLOTS)[number];

/**
 * Cores do manual exportado, todas em hexadecimal (#2b4fe0). Campo ausente = cor da marca.
 * Texto, títulos e destaque precisam de contraste de 4,5:1 com o branco.
 */
export interface ManualTheme {
  /** Destaque: links, números dos passos e marcações sobre os prints. */
  accent?: string;
  /** Texto do manual. */
  text?: string;
  /** Marca-texto: capa, "Resultado:" e destaque das imagens. */
  highlight?: string;
  /** Cor de cada tipo de título. Sem escolha, saem pretos. */
  headings?: Partial<Record<HeadingSlot, string>>;
}

export interface Manual {
  /** Caminho absoluto da pasta do manual. */
  dir: string;
  meta: ManualMeta;
}

/** Etapa da página no fluxo de aprovação. Sem status no arquivo, a página é rascunho. */
export const PAGE_STATUSES = ["rascunho", "revisao", "aprovado", "publicado"] as const;
export type PageStatus = (typeof PAGE_STATUSES)[number];

export interface Page {
  id: string;
  title: string;
  status: PageStatus;
  /** Conteúdo em Markdown, sem o frontmatter. */
  body: string;
  file: string;
}

/** Coordenadas normalizadas de 0 a 1, relativas à largura e à altura da imagem. */
export interface Point {
  x: number;
  y: number;
}

export interface Rect extends Point {
  w: number;
  h: number;
}

export interface Marker extends Point {
  id: string;
  /** Número exibido no marcador e na legenda. */
  n: number;
  label?: string;
}

export interface Highlight extends Rect {
  id: string;
}

export interface Arrow {
  id: string;
  from: Point;
  to: Point;
}

export type HotspotTarget =
  | { type: "page"; pageId: string }
  | { type: "anchor"; pageId: string; anchor: string }
  | { type: "url"; href: string };

export interface Hotspot extends Rect {
  id: string;
  target: HotspotTarget;
}

/** Conteúdo do JSON que fica ao lado de cada imagem (`assets/foto.png.json`). */
export interface Annotations {
  version: typeof FORMAT_VERSION;
  markers: Marker[];
  highlights: Highlight[];
  arrows: Arrow[];
  hotspots: Hotspot[];
}
