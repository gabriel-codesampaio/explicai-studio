/**
 * Página de erro para quem abre o Studio no navegador e o servidor não consegue entregar o editor.
 * Sem dependências: mesma composição do ErrorPage do editor (web/src/components/ErrorPage.tsx); mexeu lá, alinhe aqui.
 * O trecho entre asteriscos no título leva o marca-texto.
 */

type Lang = "pt" | "en";

const TEXTS: Record<string, Record<Lang, [title: string, text: string]>> = {
  "web-missing": {
    pt: [
      "O editor *não foi encontrado*",
      "O servidor do Studio está no ar, mas a pasta do editor está vazia ou não existe. Rode npm run build (ou instale o pacote de novo) e abra esta página outra vez.",
    ],
    en: [
      "The editor *was not found*",
      "The Studio server is running, but the editor folder is empty or missing. Run npm run build (or reinstall the package) and open this page again.",
    ],
  },
  "forbidden-host": {
    pt: ["Acesso só *deste computador*", "O Studio só aceita pedidos deste computador. Abra-o por localhost ou 127.0.0.1."],
    en: [
      "Access from *this computer* only",
      "The Studio only accepts requests from this computer. Open it through localhost or 127.0.0.1.",
    ],
  },
  "forbidden-origin": {
    pt: ["Acesso só *deste computador*", "O Studio só aceita pedidos deste computador. Abra-o por localhost ou 127.0.0.1."],
    en: [
      "Access from *this computer* only",
      "The Studio only accepts requests from this computer. Open it through localhost or 127.0.0.1.",
    ],
  },
  "not-found": {
    pt: ["Página *não encontrada*", "Este endereço não existe no Studio. Volte para o início e escolha o manual."],
    en: ["Page *not found*", "This address does not exist in the Studio. Go back to the start and pick the manual."],
  },
  error: {
    pt: [
      "O Studio *não conseguiu responder*",
      "Algo deu errado no servidor. Recarregue a página; se continuar, feche o comando explicai no terminal e rode de novo.",
    ],
    en: [
      "The Studio *could not respond*",
      "Something went wrong on the server. Reload the page; if it keeps happening, stop the explicai command in the terminal and run it again.",
    ],
  },
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);

export function pickLang(acceptLanguage: string | undefined): Lang {
  return /^\s*pt/i.test(acceptLanguage ?? "") ? "pt" : "en";
}

const UI = {
  pt: { home: "Ir para o início", reload: "Recarregar", copy: "Copiar código", copied: "Copiado" },
  en: { home: "Go to the start", reload: "Reload", copy: "Copy code", copied: "Copied" },
};

// Mesmos valores de web/src/styles/tokens.css e do wordmark de base.css.
const CSS = `
:root{color-scheme:light dark;--p:#f5f6fa;--t:#151a33;--g:#575e78;--c:#2b4fe0;--s:#fff;--l:#dce0eb;--m:rgba(255,212,59,.55);--a:#2b4fe0}
@media(prefers-color-scheme:dark){:root{--p:#0e1120;--t:#eceef7;--g:#a3aac4;--c:#8098ff;--s:#0e1120;--l:#2a3050;--m:rgba(255,212,59,.3);--a:#ffd43b}}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;flex-direction:column;background:var(--p);color:var(--t);font:17px/1.5 "Atkinson Hyperlegible Next","Segoe UI",system-ui,sans-serif}
header,main{width:100%;max-width:64rem;margin:0 auto}
header{padding:1.25rem 1.25rem}
.brand{display:inline-flex;align-items:center;gap:.5rem;color:var(--t);text-decoration:none;min-height:44px}
.wordmark{font:800 21px/1 "Archivo Variable",Archivo,"Arial Narrow",system-ui,sans-serif;font-stretch:112%;letter-spacing:-.035em}
.wordmark i{position:relative;display:inline-block;font-style:normal}
.wordmark i:after{content:"";position:absolute;left:.06em;bottom:.77em;width:.115em;height:.19em;background:var(--a);transform:skewX(-32deg);transform-origin:bottom left}
.sub{font:12px ui-monospace,Consolas,monospace;color:var(--g)}
main{margin:auto;padding:3rem 1.5rem;display:grid;justify-items:start;align-content:start;gap:1.25rem}
main>*{max-width:min(42rem,100%)}
@media(min-width:640px){header{padding-inline:2.25rem}main{padding-inline:2.5rem}}
h1{margin:0;font:800 clamp(2.25rem,7vw,3rem)/1.08 "Archivo Variable",Archivo,"Arial Narrow",system-ui,sans-serif;font-stretch:108%;letter-spacing:-.025em;text-wrap:balance;outline:none}
mark{background:var(--m);color:inherit;padding:0 .25rem;margin:0 -.25rem;border-radius:2px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
p.text{text-wrap:pretty;margin:0;max-width:65ch;font-size:1.125rem;color:var(--g)}
.actions{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 1.25rem;padding-top:.25rem}
.btn{display:inline-flex;align-items:center;min-height:44px;padding:0 1.25rem;border:0;border-radius:3px;background:var(--c);color:var(--s);font:700 1rem "Atkinson Hyperlegible Next","Segoe UI",system-ui,sans-serif;text-decoration:none;cursor:pointer}
.link{min-height:44px;padding:0 .25rem;border:0;background:none;color:var(--c);font:700 1rem "Atkinson Hyperlegible Next","Segoe UI",system-ui,sans-serif;cursor:pointer}
.link:hover{text-decoration:underline;text-underline-offset:4px}
.btn:focus-visible,.link:focus-visible,.brand:focus-visible{outline:3px solid var(--t);outline-offset:2px}
.code{display:flex;align-items:center;gap:.25rem;max-width:100%;margin-top:.5rem;padding:.125rem .25rem .125rem .75rem;border:1px dashed var(--l);border-radius:3px;font:12px ui-monospace,Consolas,monospace;color:var(--g)}
.code code{min-width:0;padding:.375rem 0;overflow-wrap:anywhere}
.code button{flex:none;min-height:44px;padding:0 .5rem;border:0;background:none;color:var(--c);font:700 12px "Atkinson Hyperlegible Next","Segoe UI",system-ui,sans-serif;cursor:pointer}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
`;

const LOGO = `<svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#2B4FE0"/><rect x="26" y="27" width="11" height="25" rx="2.5" fill="#fff"/><path d="M27.5 22 35.5 22 44.5 9.5 36.5 9.5Z" fill="#FFD43B" stroke="#FFD43B" stroke-width="1.5" stroke-linejoin="round"/></svg>`;

export function errorPage(status: number, code: string, lang: Lang): string {
  const [title, text] = (TEXTS[code] ?? TEXTS.error)?.[lang] ?? ["", ""];
  const ui = UI[lang];
  const plain = title.replaceAll("*", "");
  const marked = esc(title).replace(/\*([^*]+)\*/g, "<mark>$1</mark>");
  return `<!doctype html>
<html lang="${lang === "pt" ? "pt-BR" : "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(plain)} · Explicaí Studio</title>
<style>${CSS}</style>
</head>
<body>
<header><a class="brand" href="/" aria-label="Explicaí Studio">${LOGO}<span class="wordmark" aria-hidden="true">explica<i>ı</i></span><span class="sub" aria-hidden="true">studio</span></a></header>
<main role="alert">
<h1 id="t" tabindex="-1">${marked}</h1>
<p class="text">${esc(text)}</p>
<div class="actions"><a class="btn" href="/">${esc(ui.home)}</a><button class="link" type="button" onclick="location.reload()">${esc(ui.reload)}</button></div>
<div class="code"><code>HTTP ${status} ${esc(code)}</code><button type="button" id="c">${esc(ui.copy)}</button><span class="sr" role="status" id="s"></span></div>
</main>
<script>
document.getElementById("t").focus();
document.getElementById("c").onclick=function(){var b=this;navigator.clipboard&&navigator.clipboard.writeText("HTTP ${status} ${esc(code)}").then(function(){b.textContent=${JSON.stringify(ui.copied)};document.getElementById("s").textContent=${JSON.stringify(ui.copied)}})};
</script>
</body>
</html>
`;
}
