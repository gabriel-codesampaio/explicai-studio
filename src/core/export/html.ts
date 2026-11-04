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
import { ANNOTATION_BORDER_CSS, ANNOTATION_CSS, ANNOTATION_STYLE_CSS } from "./annotationCss.js";
import { arrowShape, arrowThickness, legendRows, placeMarkers } from "./annotationShapes.js";
import { CALLOUT_COLORS, readCallout } from "./callout.js";
import type { Collected, ExportPage } from "./collect.js";
import { muted } from "./color.js";
import { COVER_CSS, coverHtml } from "./cover.js";
import { FOOTER_CSS, footerHtml, footerPageCss } from "./footer.js";
import { exportLevels } from "./headings.js";
import { highlightExtension } from "./highlight.js";
import { type Labels, labelsFor } from "./labels.js";
import { assetFromSrc, headingAnchor, type ImageInfo, pageAnchor, pageLink, safeHref } from "./refs.js";
import { liftResult } from "./resultado.js";
import { colorSpanOpen, TEXT_COLORS } from "./textColors.js";
import { DEFAULT_TEXT, fontFacesCss, themeCss } from "./theme.js";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pct = (n: number) => `${(n * 100).toFixed(3)}%`;

/** Um arquivo HTML com o manual inteiro: sumário ao lado, uma seção por página, marcações sobre os prints. */
export function renderHtml(collected: Collected, images: Map<string, ImageInfo>, logo: string | null = null): string {
  const { meta, pages } = collected;
  const L = labelsFor(meta.language);
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
<style>${fontFacesCss(meta.theme)}
${CSS}${extraCss(meta)}${styles.length ? ANNOTATION_STYLE_CSS : ""}${styles.some((st) => st.border) ? ANNOTATION_BORDER_CSS : ""}${themeCss(meta.theme)}</style>
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
      // Só a cor do texto passa, e só com um nome da paleta (ver textColors.ts).
      html({ text }: Tokens.HTML | Tokens.Tag) {
        const color = colorSpanOpen(text);
        if (color) {
          openSpans++;
          return `<span data-color="${color}">`;
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

const CSS = `
:root{--accent:#2b4fe0;--anotacao:#2b4fe0;--anotacao-fundo:rgba(43,79,224,.08);--sobre-anotacao:#fff;--marca:#ffd43b;--marca-faixa:rgba(255,212,59,.55);--t-cover:#000;--t-page:#000;--t-h1:#000;--t-h2:#000;--t-h3:#000;--marca-faixa:rgba(255,212,59,.55);--tinta:#151a33;--grafite:#575e78;--linha:#dce0eb;--papel:#f5f6fa;
--texto:"Atkinson Hyperlegible Next","Segoe UI",system-ui,sans-serif;--display:"Archivo","Arial Narrow",system-ui,sans-serif;--mono:"JetBrains Mono",ui-monospace,Consolas,monospace}
*{box-sizing:border-box}
body{margin:0;background:#fff;color:var(--tinta);font:16px/1.65 var(--texto);-webkit-font-smoothing:antialiased}
.layout{display:grid;grid-template-columns:17rem minmax(0,1fr)}
.toc{position:sticky;top:0;height:100vh;overflow:auto;padding:24px 16px;background:var(--papel);border-right:1px solid var(--linha)}
.toc summary{display:none}
.toc-title{margin:0 0 12px;font:800 18px/1.2 var(--display)}
.toc ol{list-style:none;margin:0;padding:0}
.toc li{padding-left:calc(var(--d) * 14px)}
.toc a{display:block;padding:4px 6px;border-radius:6px;color:var(--tinta);text-decoration:none;font-size:14px}
.toc a:hover{background:#e9ecf5}
.toc li.sec a{font-size:13px;color:var(--grafite)}
a:focus-visible,summary:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.cover .start{font-size:18px}
.cover .start a{color:var(--accent)}
.page-nav{display:flex;flex-wrap:wrap;gap:8px 24px;justify-content:space-between;margin-top:32px;padding-top:12px;border-top:1px solid var(--linha);font-size:15px}
.page-nav a{display:inline-flex;align-items:center;min-height:44px;color:var(--accent)}
.page-nav .back{display:none}
a.zoom{display:block;cursor:zoom-in}
.num{font-family:var(--mono);font-size:.8em;color:var(--accent);margin-right:4px}
main{max-width:52rem;padding:32px 40px 96px;margin:0 auto;width:100%}
.cover{padding:48px 0 32px;border-bottom:3px solid var(--marca);margin-bottom:24px}
.cover h1{margin:0;color:var(--t-cover);font:800 clamp(32px,5vw,48px)/1.1 var(--display);letter-spacing:-.02em}
.logo{display:block;width:auto;height:auto;object-fit:contain}
.cover .logo{max-height:96px;max-width:min(280px,100%);margin:0 0 24px}
.toc .logo{max-height:48px;max-width:100%;margin:0 0 16px}
.cover p{margin:8px 0 0;color:var(--grafite)}
.page{padding-top:32px;scroll-margin-top:16px}
.page-title{margin:0 0 12px;color:var(--t-page);font:800 30px/1.2 var(--display);letter-spacing:-.01em}
.page-body h3,.page-body h4,.page-body h5,.page-body h6{font-family:var(--display);line-height:1.25;margin:1.4em 0 .4em;scroll-margin-top:16px}
.page-body .t1{color:var(--t-h1)}.page-body .t2{color:var(--t-h2)}.page-body .t3{color:var(--t-h3)}
.page-body h3{font-size:22px}.page-body h4{font-size:19px}.page-body h5,.page-body h6{font-size:17px}
.page-body p{margin:.6em 0}
.page-body a{color:var(--accent);text-underline-offset:.2em}
.page-body mark{background:var(--marca-faixa);color:inherit;border-radius:2px;-webkit-box-decoration-break:clone;box-decoration-break:clone;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page-body mark [data-color="orange"]{color:#a34400}.page-body mark [data-color="green"]{color:#137034}
.page-body code{font:.88em var(--mono);background:var(--papel);border:1px solid var(--linha);border-radius:4px;padding:.05em .35em}
.page-body pre{font:14px/1.5 var(--mono);background:var(--papel);border:1px solid var(--linha);border-radius:8px;padding:12px 14px;overflow-x:auto}
.page-body pre code{background:none;border:0;padding:0}
.page-body hr{border:0;border-top:1px solid var(--linha);margin:1.5em 0}
.page-body blockquote{margin:.6em 0;padding:2px 0 2px 16px;border-left:2px solid var(--linha);color:var(--grafite)}
.page-body table{border-collapse:collapse;width:100%;margin:.8em 0;font-size:15px}
.page-body th,.page-body td{border:1px solid var(--linha);padding:6px 10px;text-align:left;vertical-align:top}
.page-body th{background:var(--papel)}
.page-body ul{padding-left:1.4em}
.page-body>ol,.page-body li>ol{list-style:none;padding-left:2.25em}
.page-body>ol>li,.page-body li>ol>li{position:relative}
.page-body>ol>li+li,.page-body li>ol>li+li{margin-top:.6em}
.page-body>ol>li::before,.page-body li>ol>li::before{content:counter(list-item);position:absolute;left:-2.25em;top:.12em;display:grid;place-items:center;width:1.55em;height:1.55em;border-radius:50%;background:var(--accent);color:#fff;font:700 .82em/1 var(--mono)}
@supports(text-box:trim-both cap alphabetic){.page-body>ol>li::before,.page-body li>ol>li::before{display:block;height:auto;padding-block:calc((1.55em - 1cap)/2);text-align:center;text-box:trim-both cap alphabetic}}
.page-body li>blockquote{margin:.6em 0 0;padding:0;border:0;color:var(--tinta)}
.page-body li>blockquote>p{display:inline;background:linear-gradient(transparent 50%,var(--marca-faixa) 50%)}
.page-body li>blockquote>p>strong:first-child{font:700 .78em var(--mono);letter-spacing:.04em;text-transform:uppercase}
.page-body .callout{margin:.8em 0;padding:10px 14px;border:1px solid color-mix(in srgb,var(--c) 35%,#fff);border-left:4px solid var(--c);border-radius:3px;background:color-mix(in srgb,var(--c) 8%,#fff);color:var(--tinta)}
.page-body .callout>:last-child{margin-bottom:0}
.page-body .callout-label{margin:0 0 .3em;color:color-mix(in srgb,var(--c) 85%,#000);font:700 .78em var(--mono);letter-spacing:.06em;text-transform:uppercase}
${Object.entries(CALLOUT_COLORS)
  .map(([type, hex]) => `.callout[data-callout="${type}"]{--c:${type === "note" ? "var(--accent)" : hex}}`)
  .join("")}
.shot{display:block;margin:.6em 0}
${ANNOTATION_CSS}
.missing{color:#c8411f;font-style:italic}
${Object.entries(TEXT_COLORS)
  .map(([name, hex]) => `[data-color="${name}"]{color:${hex}}`)
  .join("")}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.colophon{margin-top:64px;padding-top:16px;border-top:1px solid var(--linha);color:var(--grafite);font-size:13px}
@media (max-width:800px){.layout{display:block}.toc{position:static;height:auto;border-right:0;border-bottom:1px solid var(--linha)}main{padding:24px 20px 64px}
.toc summary{display:flex;align-items:center;min-height:44px;font-weight:700;cursor:pointer}
.toc a{padding:10px 6px}
.page-nav .back{display:inline-flex}}
@media print{
@page{margin:18mm 16mm}
body{font-size:11.5pt}
.layout{display:block}.toc,.page-nav{display:none}main{max-width:none;padding:0}
.cover{padding:30vh 0 0;border:0;break-after:page}
.page{break-before:page;padding-top:0}
.shot,.callout,.page-body table,.page-body pre,.page-body li{break-inside:avoid}
.page-body a{color:var(--tinta)}
.hot{border-style:dashed}
}
`;
