import { Marked, type Tokens } from "marked";
import {
  type AnnotationStyle,
  arrowHalo,
  MARKER_SIZES,
  resolveItemStyle,
  STROKE_SCALE,
  type StyleItemKind,
  styleVars,
} from "../annotationStyle.js";
import type { Annotations, HotspotTarget, Point } from "../types.js";
import { ANNOTATION_BORDER_CSS, ANNOTATION_STYLE_CSS } from "./annotationCss.js";
import { arrowShape, arrowThickness, legendRows, placeMarkers } from "./annotationShapes.js";
import { readCallout } from "./callout.js";
import type { Collected, ExportPage } from "./collect.js";
import { muted } from "./color.js";
import { COVER_CSS, coverHtml } from "./cover.js";
import { fontSpanOpen, fontStack, inlineFonts } from "./fonts.js";
import { FOOTER_CSS, footerHtml, footerPageCss } from "./footer.js";
import { exportLevels } from "./headings.js";
import { highlightExtension } from "./highlight.js";
import { CSS } from "./htmlCss.js";
import { type Labels, labelsFor } from "./labels.js";
import { assetFromSrc, headingAnchor, type ImageInfo, pageAnchor, pageLink, safeHref } from "./refs.js";
import { liftResult } from "./resultado.js";
import { colorSpanOpen } from "./textColors.js";
import { DEFAULT_TEXT, fontFacesCss, themeCss } from "./theme.js";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pct = (n: number) => `${(n * 100).toFixed(3)}%`;

/** Um arquivo HTML com o manual inteiro: sumário ao lado, uma seção por página, marcações sobre os prints. */
export function renderHtml(collected: Collected, images: Map<string, ImageInfo>, logo: string | null = null): string {
  const { meta, pages } = collected;
  const L = labelsFor(meta.language);
  const inline = inlineFonts(pages.map((p) => p.body));
  const toc = pages
    .flatMap((p) => {
      const heads = pageHeadings(p.body);
      const top = Math.min(...heads.map((h) => h.depth));
      return [
        `<li style="--d:${p.depth}"><a href="#${pageAnchor(p.id)}"><span class="num">${p.number}</span> ${esc(p.title)}</a></li>`,
        ...heads.map(
          (h) =>
            `<li class="sec" style="--d:${p.depth + 1 + Math.min(h.depth - top, 2)}"><a href="#${headingAnchor(p.id, h.text)}">${esc(plain(h.text))}</a></li>`,
        ),
      ];
    })
    .join("\n");
  const minutes = Math.max(1, Math.round(pages.reduce((n, p) => n + p.body.split(/\s+/).length, 0) / 200));
  const first = pages[0];
  const start = first ? `<p class="start">${L.start} <a href="#${pageAnchor(first.id)}">${esc(first.title)}</a></p>\n` : "";
  const logoImg = logo
    ? `<img class="logo" src="${esc(logo)}" alt="">
`
    : "";
  const styles = [...images.values()].flatMap((i) => styleOf(i.annotations));
  const foot = footerHtml(meta.footer) + (meta.theme?.hideColophon ? "" : L.colophon);
  const sections = pages.map((p, i) => renderPage(p, pages, images, L, pages[i - 1], pages[i + 1])).join("\n");

  return `<!doctype html>
<html lang="${esc(meta.language)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="Explicaí Studio">
<title>${esc(meta.title)}</title>
<style>${fontFacesCss(meta.theme, inline)}
${CSS}${extraCss(meta)}${styles.length ? ANNOTATION_STYLE_CSS : ""}${styles.some((st) => st.border) ? ANNOTATION_BORDER_CSS : ""}${themeCss(meta.theme)}${inline.map((f) => `[data-font="${f.id}"]{font-family:${fontStack(f)}}`).join("")}</style>
</head>
<body>
<div class="layout">
<nav class="toc" id="sumario" aria-label="${L.toc}">
${logoImg}<p class="toc-title">${esc(meta.title)}</p>
<details open>
<summary>${L.toc}</summary>
<ol>
${toc}
</ol>
</details>
</nav>
<main>
<header class="cover">
${logoImg}<h1>${esc(meta.title)}</h1>
${coverHtml(meta.cover)}<p>${pages.length ? L.readTime(pages.length, minutes) : L.pages(0)}</p>
${start}</header>
${sections}
${foot ? `<footer class="colophon">${foot}</footer>` : ""}
</main>
</div>
</body>
</html>
`;
}

/** CSS da capa e do rodapé: só entra quando o manual tem texto de capa ou de rodapé. */
function extraCss(meta: Collected["meta"]): string {
  const css = [
    meta.cover && Object.keys(meta.cover).length ? COVER_CSS : "",
    footerHtml(meta.footer) ? FOOTER_CSS : "",
    footerPageCss(meta.footer, muted(meta.theme?.text ?? DEFAULT_TEXT)),
  ].join("");
  // No papel o texto do rodapé vai na margem de cada página; a linha do fim só aparece na tela.
  return css
    ? `${css}@media print{.foot-text{display:none}}
`
    : "";
}

/** Títulos do texto da página, na ordem. */
function pageHeadings(body: string): { depth: number; text: string }[] {
  const out: { depth: number; text: string }[] = [];
  const lexer = new Marked({ gfm: true });
  lexer.walkTokens(lexer.lexer(body), (t) => {
    if (t.type === "heading") out.push({ depth: (t as Tokens.Heading).depth, text: (t as Tokens.Heading).text });
  });
  return out;
}

/** Texto do título sem as marcas do Markdown, para o sumário. */
const plain = (md: string) => md.replace(/[*_`]/g, "");

function renderPage(
  page: ExportPage,
  pages: ExportPage[],
  images: Map<string, ImageInfo>,
  L: Labels,
  prev?: ExportPage,
  next?: ExportPage,
): string {
  const titleLevel = Math.min(page.depth + 2, 3);
  const levels = exportLevels(
    pageHeadings(page.body).map((h) => h.depth),
    titleLevel,
  );
  let seen = 0;
  let openSpans = 0;
  const marked = new Marked({
    gfm: true,
    extensions: [highlightExtension],
    walkTokens(t) {
      if (t.type === "list_item") liftResult(t as Tokens.ListItem);
    },
    renderer: {
      // Os títulos ficam abaixo do título da página, sem pular nível (ver exportLevels).
      heading({ tokens, text, depth }: Tokens.Heading) {
        const level = levels[seen++] ?? 6;
        return `<h${level} class="t${Math.min(depth, 3)}" id="${headingAnchor(page.id, text)}">${this.parser.parseInline(tokens)}</h${level}>\n`;
      },
      link({ href, tokens }: Tokens.Link) {
        const target = pageLink(href, pages) ?? safeHref(href);
        const text = this.parser.parseInline(tokens);
        if (!target) return text;
        const external = /^https?:/i.test(target) ? ' rel="noopener noreferrer"' : "";
        return `<a href="${esc(target)}"${external}>${text}</a>`;
      },
      image({ href, text }: Tokens.Image) {
        const asset = assetFromSrc(href);
        const info = asset ? images.get(asset) : undefined;
        if (!info) return `<span class="missing">[${L.missingImage}: ${esc(text || href)}]</span>`;
        return renderShot(info, text, pages, L);
      },
      // Alerta GFM vira painel com rótulo em texto; outra citação segue como estava.
      blockquote({ tokens }: Tokens.Blockquote) {
        const callout = readCallout(tokens);
        if (!callout)
          return `<blockquote>
${this.parser.parse(tokens)}</blockquote>
`;
        return `<div class="callout" data-callout="${callout.type}" role="note"><p class="callout-label">${L.callouts[callout.type]}</p>
${this.parser.parse(callout.body)}</div>
`;
      },
      // HTML colado no texto sai como texto: o manual exportado não roda código de ninguém.
      // Só passam a cor do texto (nome da paleta, ver textColors.ts) e a fonte do trecho (id da lista, ver fonts.ts).
      html({ text }: Tokens.HTML | Tokens.Tag) {
        const color = colorSpanOpen(text);
        if (color) {
          openSpans++;
          return `<span data-color="${color}">`;
        }
        const font = fontSpanOpen(text);
        if (font) {
          openSpans++;
          return `<span data-font="${font.id}">`;
        }
        if (text === "</span>" && openSpans > 0) {
          openSpans--;
          return text;
        }
        return esc(text);
      },
    },
  });
  const body = marked.parse(page.body, { async: false });
  return `<section class="page" id="${pageAnchor(page.id)}">
<h${titleLevel} class="page-title"><span class="num">${page.number}</span> ${esc(page.title)}</h${titleLevel}>
<div class="page-body">${body}</div>
<nav class="page-nav" aria-label="${L.pageNav}">
${prev ? `<a rel="prev" href="#${pageAnchor(prev.id)}">← ${L.prev}: ${esc(prev.title)}</a>` : ""}<a class="back" href="#sumario">${L.backToToc}</a>${next ? `<a rel="next" href="#${pageAnchor(next.id)}">${L.next}: ${esc(next.title)} →</a>` : ""}
</nav>
</section>`;
}

function hotspotHref(target: HotspotTarget, pages: ExportPage[]): { href: string; label: string } | null {
  if (target.type === "url") {
    const href = safeHref(target.href);
    return href ? { href, label: target.href } : null;
  }
  const page = pages.find((p) => p.id === target.pageId);
  if (!page) return null;
  const href = target.type === "anchor" ? `#${headingAnchor(page.id, target.anchor)}` : `#${pageAnchor(page.id)}`;
  return { href, label: page.title };
}

/** Todos os `style` de uma imagem: o dela e o de cada marcação. */
export const styleOf = (a: Annotations): AnnotationStyle[] =>
  [a.style, ...[...a.markers, ...a.highlights, ...a.arrows, ...a.hotspots].map((i) => i.style)].filter(
    (st): st is AnnotationStyle => Boolean(st),
  );

/** Variáveis CSS do estilo como atributo `style=""` (com `;` na frente, para juntar a outro). */
const varsAttr = (st: AnnotationStyle | undefined, kind?: StyleItemKind) =>
  Object.entries(styleVars(st, false, kind))
    .map(([k, v]) => `;${k}:${v}`)
    .join("");

/** Print mais largo que uma tela de celular leva um link para o original (sem JavaScript; o teclado alcança). */
const ZOOM_MIN_WIDTH = 600;
const zoom = (img: string, info: ImageInfo, L: Labels) =>
  info.size && info.size.w > ZOOM_MIN_WIDTH
    ? `<a class="zoom" href="${esc(info.asset)}" target="_blank" rel="noopener">${img}<span class="sr">${L.openOriginal}</span></a>`
    : img;

/** O print com as marcações por cima (posições em %, acompanham o tamanho) e a legenda embaixo. */
function renderShot(info: ImageInfo, alt: string, pages: ExportPage[], L: Labels): string {
  const a: Annotations = info.annotations;
  const w = info.size?.w ?? 1000;
  const h = info.size?.h ?? 1000;
  const box = (r: { x: number; y: number; w: number; h: number }) =>
    `left:${pct(r.x)};top:${pct(r.y)};width:${pct(r.w)};height:${pct(r.h)}`;

  const highlights = a.highlights
    .map((r) => `<span class="hl" style="${box(r)}${varsAttr(resolveItemStyle(r.style, a.style), "highlight")}"></span>`)
    .join("");
  const hotspots = a.hotspots
    .map((r) => {
      const link = hotspotHref(r.target, pages);
      return link
        ? `<a class="hot" href="${esc(link.href)}" style="${box(r)}${varsAttr(resolveItemStyle(r.style, a.style))}"><span class="sr">${L.goTo} ${esc(link.label)}</span></a>`
        : "";
    })
    .join("");
  const unit = Math.max(w, h);
  const px = (p: Point) => ({ x: p.x * w, y: p.y * h });
  const f1 = (n: number) => n.toFixed(1);
  const arrows = a.arrows.length
    ? `<svg class="arrows" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${a.arrows
        .map(({ from, to, style }) => {
          const eff = { ...a.style, ...style };
          const t = arrowThickness(unit, STROKE_SCALE[eff.stroke ?? "m"]);
          const { shaft: s, head } = arrowShape(px(from), px(to), t);
          const line = `x1="${f1(s.x1)}" y1="${f1(s.y1)}" x2="${f1(s.x2)}" y2="${f1(s.y2)}"`;
          const pts = head.map((p) => `${f1(p.x)},${f1(p.y)}`).join(" ");
          const halo = arrowHalo(t, eff.border);
          const under = halo
            ? `<line class="halo" ${line} stroke-width="${f1(halo.shaft)}"/><polygon class="halo" points="${pts}" stroke-width="${f1(halo.head)}"/>`
            : "";
          const body = `${under}<line ${line} stroke-width="${f1(t)}"/><polygon points="${pts}"/>`;
          const vars = varsAttr(style).slice(1);
          return vars ? `<g style="${vars}">${body}</g>` : body;
        })
        .join("")}</svg>`
    : "";
  // O disco tem tamanho fixo em px; a direção da cauda sai de um quadro de referência estreito, que vale também em tela pequena.
  const ref = Math.min(1, MARKER_REF_WIDTH / w);
  const shapes = placeMarkers(
    a.markers.map((m) => ({ x: m.x * w * ref, y: m.y * h * ref })),
    w * ref,
    h * ref,
    a.markers.map((m) => MARKER_SIZES[m.style?.size ?? a.style?.size ?? "m"].disc),
  );
  const markers = a.markers
    .map((m, i) => {
      const { disc, tail } = shapes[i] as (typeof shapes)[number];
      const svg = tail
        ? `<svg class="tail" width="1" height="1" aria-hidden="true"><polygon points="${tail.map((p) => `${f1(p.x)},${f1(p.y)}`).join(" ")}"/></svg>`
        : "";
      return `<span class="mk" style="left:${pct(m.x)};top:${pct(m.y)}${varsAttr(m.style)}" aria-hidden="true">${svg}<span class="disc" style="transform:translate(${f1(disc.x)}px,${f1(disc.y)}px)" data-n="${m.n}"></span></span>`;
    })
    .join("");
  const legend = legendRows(a.markers)
    .map(
      (r) =>
        `<span class="row" role="listitem"${r.style?.color ? ` style="${varsAttr({ color: r.style.color }).slice(1)}"` : ""}><span class="n">${r.n}</span><span>${esc(r.label)}</span></span>`,
    )
    .join("");

  const img = `<img src="${esc(info.asset)}" alt="${esc(alt)}"${info.size ? ` width="${w}" height="${h}"` : ""} loading="lazy">`;
  const vars = Object.entries(styleVars(a.style))
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
  return `<span class="shot${a.display ? ` shot-${a.display}` : ""}"${vars ? ` style="${vars}"` : ""}><span class="frame" style="aspect-ratio:${w} / ${h}">${zoom(img, info, L)}${highlights}${arrows}${hotspots}${markers}</span>${
    legend ? `<span class="legend" role="list" aria-label="${L.legend}">${legend}</span>` : ""
  }</span>`;
}

/** Largura do quadro em que se decide para onde cada cauda aponta (px): estreito de propósito, para o disco caber também no celular. */
const MARKER_REF_WIDTH = 320;
