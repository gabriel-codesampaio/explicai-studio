import { ANNOTATION_CSS } from "./annotationCss.js";
import { CALLOUT_COLORS } from "./callout.js";
import { TEXT_COLORS } from "./textColors.js";

/** CSS base do manual exportado (tela e impressão). */
export const CSS = `
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
