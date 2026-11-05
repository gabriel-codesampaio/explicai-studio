import type { Labels } from "./labels.js";

/** Busca do sumário: o campo nasce `hidden` e o script o mostra, então sem JavaScript o sumário segue como era. */
export const TOC_SEARCH_CSS = `.toc-search{margin:0 0 12px}
.toc-search label{display:block;margin-bottom:4px;font:700 13px var(--mono)}
.toc-search input{width:100%;min-height:44px;padding:6px 10px;border:1px solid var(--grafite);border-radius:6px;background:#fff;color:var(--tinta);font:inherit;font-size:15px}
.toc-search input:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.toc-search [role=status]{margin:4px 0 0;color:var(--grafite);font-size:13px}
@media screen{.page.hit{box-shadow:-12px 0 0 -8px var(--marca)}.toc li.hit>a{background:var(--marca-faixa)}}
`;

export function tocSearchHtml(L: Labels): string {
  const r = L.searchResults;
  const a = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return `<div class="toc-search" hidden data-zero="${a(r.zero)}" data-one="${a(r.one)}" data-many="${a(r.many)}">
<label for="toc-q">${L.search}</label>
<input id="toc-q" type="search" autocomplete="off" spellcheck="false">
<p role="status" aria-live="polite"></p>
</div>`;
}

/** Normaliza para comparar: sem acento, sem caixa. Mesmo critério do slugify do núcleo. */
export const NORMALIZE_SRC = `function norm(s){return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}`;

/**
 * Script inline do export. Sem eval, sem innerHTML: o termo só passa por `value`, `textContent`, `hidden` e `classList`.
 * Texto das seções (título e corpo, sem a navegação entre páginas) lido uma vez; busca por trecho, sem relevância.
 */
export const TOC_SEARCH_SCRIPT = `(function(){
${NORMALIZE_SRC}
var box=document.querySelector(".toc-search");if(!box)return;
var input=box.querySelector("input"),out=box.querySelector("[role=status]");
var items=[].map.call(document.querySelectorAll(".toc li"),function(li){
var a=li.querySelector("a"),id=a&&a.getAttribute("href").slice(1),target=id&&document.getElementById(id);
var page=target&&target.closest(".page");
return{li:li,sec:li.classList.contains("sec"),page:page,own:norm(li.textContent||""),text:null}});
var pages=[].slice.call(document.querySelectorAll(".page"));
var texts=null;
function run(){
var q=norm(input.value.trim());
if(!texts)texts=pages.map(function(p){return norm([].map.call(p.querySelectorAll(".page-title,.page-body"),function(e){return e.textContent}).join(" "))});
var hit=pages.map(function(p,i){return q!==""&&texts[i].indexOf(q)>-1});
pages.forEach(function(p,i){p.classList.toggle("hit",hit[i])});
items.forEach(function(it){
var on=q===""||(it.sec?it.own.indexOf(q)>-1:!!it.page&&hit[pages.indexOf(it.page)]);
it.li.hidden=!on;it.li.classList.toggle("hit",q!==""&&on)});
var n=hit.filter(Boolean).length;
out.textContent=q===""?"":(n===0?box.dataset.zero:n===1?box.dataset.one:box.dataset.many).replace("{n}",String(n))}
input.addEventListener("input",run);
box.hidden=false})();`;
