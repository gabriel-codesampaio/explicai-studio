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

export interface ManualTheme {
  /** Cor de destaque em hexadecimal (#2b4fe0): títulos, links e números dos passos no HTML e no PDF. */
  accent?: string;
}

export interface Manual {
  /** Caminho absoluto da pasta do manual. */
  dir: string;
  meta: ManualMeta;
}

export interface Page {
  id: string;
  title: string;
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
