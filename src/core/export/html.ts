import { Marked, type Tokens } from "marked";
import type { Annotations, HotspotTarget, Point } from "../types.js";
import type { Collected, ExportPage } from "./collect.js";
import { exportLevels } from "./headings.js";
import { type Labels, labelsFor } from "./labels.js";
import { assetFromSrc, headingAnchor, type ImageInfo, pageAnchor, pageLink, safeHref } from "./refs.js";

/** Cor da marca, quando o manual não escolheu outra. */
export const DEFAULT_ACCENT = "#2b4fe0";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pct = (n: number) => `${(n * 100).toFixed(3)}%`;

/** Um arquivo HTML com o manual inteiro: sumário ao lado, uma seção por página, marcações sobre os prints. */
export function renderHtml(collected: Collected, images: Map<string, ImageInfo>): string {
  const { meta, pages } = collected;
  const L = labelsFor(meta.language);
  const accent = meta.theme?.accent ?? DEFAULT_ACCENT;
  const toc = pages
    .map(
      (p) =>
        `<li style="--d:${p.depth}"><a href="#${pageAnchor(p.id)}"><span class="num">${p.number}</span> ${esc(p.title)}</a></li>`,
    )
    .join("\n");
  const sections = pages.map((p) => renderPage(p, pages, images, L)).join("\n");

  return `<!doctype html>
<html lang="${esc(meta.language)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="Explicaí Studio">
<title>${esc(meta.title)}</title>
<style>${CSS.replace("__ACCENT__", accent)}</style>
</head>
<body>
<div class="layout">
<nav class="toc" aria-label="${L.toc}">
<p class="toc-title">${esc(meta.title)}</p>
<ol>
${toc}
</ol>
</nav>
<main>
<header class="cover">
<h1>${esc(meta.title)}</h1>
<p>${L.pages(pages.length)}</p>
</header>
${sections}
<footer class="colophon">${L.colophon}</footer>
</main>
</div>
</body>
</html>
`;
}

function renderPage(page: ExportPage, pages: ExportPage[], images: Map<string, ImageInfo>, L: Labels): string {
  const titleLevel = Math.min(page.depth + 2, 3);
  const depths: number[] = [];
  const lexer = new Marked({ gfm: true });
  lexer.walkTokens(lexer.lexer(page.body), (t) => {
    if (t.type === "heading") depths.push((t as Tokens.Heading).depth);
  });
  const levels = exportLevels(depths, titleLevel);
  let next = 0;
  const marked = new Marked({
    gfm: true,
    renderer: {
      // Os títulos ficam abaixo do título da página, sem pular nível (ver exportLevels).
      heading({ tokens, text }: Tokens.Heading) {
        const level = levels[next++] ?? 6;
        return `<h${level} id="${headingAnchor(page.id, text)}">${this.parser.parseInline(tokens)}</h${level}>\n`;
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
      // HTML colado no texto sai como texto: o manual exportado não roda código de ninguém.
      html({ text }: Tokens.HTML | Tokens.Tag) {
        return esc(text);
      },
    },
  });
  const body = marked.parse(page.body, { async: false });
  return `<section class="page" id="${pageAnchor(page.id)}">
<h${titleLevel} class="page-title"><span class="num">${page.number}</span> ${esc(page.title)}</h${titleLevel}>
<div class="page-body">${body}</div>
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

/** O print com as marcações por cima (posições em %, acompanham o tamanho) e a legenda embaixo. */
function renderShot(info: ImageInfo, alt: string, pages: ExportPage[], L: Labels): string {
  const a: Annotations = info.annotations;
  const w = info.size?.w ?? 1000;
  const h = info.size?.h ?? 1000;
  const box = (r: { x: number; y: number; w: number; h: number }) =>
    `left:${pct(r.x)};top:${pct(r.y)};width:${pct(r.w)};height:${pct(r.h)}`;

  const highlights = a.highlights.map((r) => `<span class="hl" style="${box(r)}"></span>`).join("");
  const hotspots = a.hotspots
    .map((r) => {
      const link = hotspotHref(r.target, pages);
      return link
        ? `<a class="hot" href="${esc(link.href)}" style="${box(r)}"><span class="sr">${L.goTo} ${esc(link.label)}</span></a>`
        : "";
    })
    .join("");
  const unit = Math.max(w, h);
  const px = (p: Point) => ({ x: p.x * w, y: p.y * h });
  const arrows = a.arrows.length
    ? `<svg class="arrows" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${a.arrows
        .map(({ from, to }) => {
          const f = px(from);
          const t = px(to);
          const angle = Math.atan2(t.y - f.y, t.x - f.x);
          const size = unit * 0.022;
          const wing = (d: number) =>
            `${(t.x - size * Math.cos(angle + d)).toFixed(1)},${(t.y - size * Math.sin(angle + d)).toFixed(1)}`;
          return `<line x1="${f.x.toFixed(1)}" y1="${f.y.toFixed(1)}" x2="${t.x.toFixed(1)}" y2="${t.y.toFixed(1)}" stroke-width="${(unit * 0.005).toFixed(1)}"/><polygon points="${t.x.toFixed(1)},${t.y.toFixed(1)} ${wing(0.45)} ${wing(-0.45)}"/>`;
        })
        .join("")}</svg>`
    : "";
  const markers = a.markers
    .map((m) => `<span class="mk" style="left:${pct(m.x)};top:${pct(m.y)}" aria-hidden="true">${m.n}</span>`)
    .join("");
  const legend = [...a.markers]
    .sort((x, y) => x.n - y.n)
    .map((m) => `<span role="listitem"><span class="n">${m.n}</span> ${esc(m.label ?? "")}</span>`)
    .join("");

  return `<span class="shot"><span class="frame" style="aspect-ratio:${w} / ${h}"><img src="${esc(info.asset)}" alt="${esc(alt)}" loading="lazy">${highlights}${arrows}${hotspots}${markers}</span>${
    legend ? `<span class="legend" role="list" aria-label="${L.legend}">${legend}</span>` : ""
  }</span>`;
}

const CSS = `
@font-face{font-family:"Archivo";src:url(fonts/archivo-latin-wght-normal.woff2) format("woff2");font-weight:100 900;font-style:normal;font-display:block}
@font-face{font-family:"JetBrains Mono";src:url(fonts/jetbrains-mono-latin-wght-normal.woff2) format("woff2");font-weight:100 900;font-style:normal;font-display:block}
@font-face{font-family:"Atkinson Hyperlegible Next";src:url(fonts/atkinson-hyperlegible-next-latin-400-normal.woff2) format("woff2");font-weight:400;font-style:normal;font-display:block}
@font-face{font-family:"Atkinson Hyperlegible Next";src:url(fonts/atkinson-hyperlegible-next-latin-400-italic.woff2) format("woff2");font-weight:400;font-style:italic;font-display:block}
@font-face{font-family:"Atkinson Hyperlegible Next";src:url(fonts/atkinson-hyperlegible-next-latin-700-normal.woff2) format("woff2");font-weight:700;font-style:normal;font-display:block}
:root{--accent:__ACCENT__;--anotacao:#2b4fe0;--marca:#ffd43b;--marca-faixa:rgba(255,212,59,.55);--tinta:#151a33;--grafite:#575e78;--linha:#dce0eb;--papel:#f5f6fa;
--texto:"Atkinson Hyperlegible Next","Segoe UI",system-ui,sans-serif;--display:"Archivo","Arial Narrow",system-ui,sans-serif;--mono:"JetBrains Mono",ui-monospace,Consolas,monospace}
*{box-sizing:border-box}
body{margin:0;background:#fff;color:var(--tinta);font:16px/1.65 var(--texto);-webkit-font-smoothing:antialiased}
.layout{display:grid;grid-template-columns:17rem minmax(0,1fr)}
.toc{position:sticky;top:0;height:100vh;overflow:auto;padding:24px 16px;background:var(--papel);border-right:1px solid var(--linha)}
.toc-title{margin:0 0 12px;font:800 18px/1.2 var(--display)}
.toc ol{list-style:none;margin:0;padding:0}
.toc li{padding-left:calc(var(--d) * 14px)}
.toc a{display:block;padding:4px 6px;border-radius:6px;color:var(--tinta);text-decoration:none;font-size:14px}
.toc a:hover{background:#e9ecf5}
.num{font-family:var(--mono);font-size:.8em;color:var(--accent);margin-right:4px}
main{max-width:52rem;padding:32px 40px 96px;margin:0 auto;width:100%}
.cover{padding:48px 0 32px;border-bottom:3px solid var(--marca);margin-bottom:24px}
.cover h1{margin:0;font:800 clamp(32px,5vw,48px)/1.1 var(--display);letter-spacing:-.02em}
.cover p{margin:8px 0 0;color:var(--grafite)}
.page{padding-top:32px;scroll-margin-top:16px}
.page-title{margin:0 0 12px;font:800 30px/1.2 var(--display);letter-spacing:-.01em}
.page-body h3,.page-body h4,.page-body h5,.page-body h6{font-family:var(--display);line-height:1.25;margin:1.4em 0 .4em;scroll-margin-top:16px}
.page-body h3{font-size:22px}.page-body h4{font-size:19px}.page-body h5,.page-body h6{font-size:17px}
.page-body p{margin:.6em 0}
.page-body a{color:var(--accent);text-underline-offset:.2em}
.page-body code{font:.88em var(--mono);background:var(--papel);border:1px solid var(--linha);border-radius:4px;padding:.05em .35em}
.page-body pre{font:14px/1.5 var(--mono);background:var(--papel);border:1px solid var(--linha);border-radius:8px;padding:12px 14px;overflow-x:auto}
.page-body pre code{background:none;border:0;padding:0}
.page-body blockquote{margin:.6em 0;padding:2px 0 2px 16px;border-left:2px solid var(--linha);color:var(--grafite)}
.page-body table{border-collapse:collapse;width:100%;margin:.8em 0;font-size:15px}
.page-body th,.page-body td{border:1px solid var(--linha);padding:6px 10px;text-align:left;vertical-align:top}
.page-body th{background:var(--papel)}
.page-body ul{padding-left:1.4em}
.page-body>ol,.page-body li>ol{list-style:none;counter-reset:passo;padding-left:2.25em}
.page-body>ol>li,.page-body li>ol>li{counter-increment:passo;position:relative}
.page-body>ol>li+li,.page-body li>ol>li+li{margin-top:.6em}
.page-body>ol>li::before,.page-body li>ol>li::before{content:counter(passo);position:absolute;left:-2.25em;top:.12em;display:grid;place-items:center;width:1.55em;height:1.55em;border-radius:50%;background:var(--accent);color:#fff;font:700 .82em var(--mono)}
.page-body li>blockquote{margin:.6em 0 0;padding:0;border:0;color:var(--tinta)}
.page-body li>blockquote>p{display:inline;background:linear-gradient(transparent 50%,var(--marca-faixa) 50%)}
.page-body li>blockquote>p>strong:first-child{font:700 .78em var(--mono);letter-spacing:.04em;text-transform:uppercase}
.shot{display:block;margin:.6em 0}
.frame{position:relative;display:block;max-width:100%;width:fit-content}
.frame img{display:block;max-width:100%;height:auto;border:1px solid var(--linha);border-radius:8px}
.hl{position:absolute;border:2px solid var(--marca);background:rgba(255,212,59,.3);border-radius:3px}
.hot{position:absolute;border:2px dashed var(--anotacao);background:rgba(43,79,224,.08);border-radius:3px}
.arrows{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.arrows line{stroke:var(--anotacao);stroke-linecap:round}
.arrows polygon{fill:var(--anotacao)}
.mk{position:absolute;transform:translate(-50%,-50%);display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--anotacao);color:#fff;font:600 13px var(--mono);box-shadow:0 0 0 2px #fff,0 2px 6px rgba(21,26,51,.35)}
.legend{display:grid;gap:4px;margin-top:8px;font-size:15px}
.legend .n{display:inline-grid;place-items:center;width:20px;height:20px;margin-right:6px;border-radius:50%;background:var(--anotacao);color:#fff;font:600 11px var(--mono);vertical-align:1px}
.missing{color:#c8411f;font-style:italic}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.colophon{margin-top:64px;padding-top:16px;border-top:1px solid var(--linha);color:var(--grafite);font-size:13px}
@media (max-width:800px){.layout{display:block}.toc{position:static;height:auto;border-right:0;border-bottom:1px solid var(--linha)}main{padding:24px 20px 64px}}
@media print{
@page{margin:18mm 16mm}
body{font-size:11.5pt}
.layout{display:block}.toc{display:none}main{max-width:none;padding:0}
.cover{padding:30vh 0 0;border:0;break-after:page}
.page{break-before:page;padding-top:0}
.shot,.page-body table,.page-body pre,.page-body li{break-inside:avoid}
.page-body a{color:var(--tinta)}
.hot{border-style:dashed}
}
`;
