/** Página de erro para quem abre o Studio no navegador e o servidor não consegue entregar o editor. Sem dependências. */

type Lang = "pt" | "en";

const TEXTS: Record<string, Record<Lang, [title: string, text: string]>> = {
  "web-missing": {
    pt: [
      "O editor não foi encontrado",
      "O servidor do Studio está no ar, mas a pasta do editor está vazia ou não existe. Rode npm run build (ou instale o pacote de novo) e abra esta página outra vez.",
    ],
    en: [
      "The editor was not found",
      "The Studio server is running, but the editor folder is empty or missing. Run npm run build (or reinstall the package) and open this page again.",
    ],
  },
  "forbidden-host": {
    pt: ["Acesso só deste computador", "O Studio só aceita pedidos deste computador. Abra-o por localhost ou 127.0.0.1."],
    en: [
      "Access from this computer only",
      "The Studio only accepts requests from this computer. Open it through localhost or 127.0.0.1.",
    ],
  },
  "forbidden-origin": {
    pt: ["Acesso só deste computador", "O Studio só aceita pedidos deste computador. Abra-o por localhost ou 127.0.0.1."],
    en: [
      "Access from this computer only",
      "The Studio only accepts requests from this computer. Open it through localhost or 127.0.0.1.",
    ],
  },
  "not-found": {
    pt: ["Página não encontrada", "Este endereço não existe no Studio. Volte para o início e escolha o manual."],
    en: ["Page not found", "This address does not exist in the Studio. Go back to the start and pick the manual."],
  },
  error: {
    pt: [
      "O Studio não conseguiu responder",
      "Algo deu errado no servidor. Recarregue a página; se continuar, feche o comando explicai no terminal e rode de novo.",
    ],
    en: [
      "The Studio could not respond",
      "Something went wrong on the server. Reload the page; if it keeps happening, stop the explicai command in the terminal and run it again.",
    ],
  },
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);

export function pickLang(acceptLanguage: string | undefined): Lang {
  return /^\s*pt/i.test(acceptLanguage ?? "") ? "pt" : "en";
}

export function errorPage(status: number, code: string, lang: Lang): string {
  const [title, text] = (TEXTS[code] ?? TEXTS.error)?.[lang] ?? ["", ""];
  const home = lang === "pt" ? "Ir para o início" : "Go to the start";
  return `<!doctype html>
<html lang="${lang === "pt" ? "pt-BR" : "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · Explicaí Studio</title>
<style>
:root{color-scheme:light dark;--p:#f5f6fa;--t:#151a33;--g:#575e78;--c:#2b4fe0;--s:#fff}
@media(prefers-color-scheme:dark){:root{--p:#0e1120;--t:#eceef7;--g:#a3aac4;--c:#8098ff;--s:#0e1120}}
body{margin:0;min-height:100vh;background:var(--p);color:var(--t);font:17px/1.5 "Atkinson Hyperlegible Next","Segoe UI",system-ui,sans-serif}
main{max-width:32rem;margin:0 auto;padding:16vh 1.5rem 2rem}
h1{font:800 1.875rem/1.15 Archivo,"Arial Narrow",system-ui,sans-serif;margin:0 0 1rem;text-wrap:balance}
p{color:var(--g);margin:0 0 1.25rem}
a{display:inline-flex;align-items:center;min-height:44px;padding:0 1rem;border-radius:3px;background:var(--c);color:var(--s);font-weight:700;text-decoration:none}
a:focus-visible{outline:3px solid var(--t);outline-offset:2px}
code{display:block;margin-top:1.25rem;font:12px ui-monospace,Consolas,monospace;color:var(--g)}
</style>
</head>
<body>
<main role="alert">
<h1>${esc(title)}</h1>
<p>${esc(text)}</p>
<a href="/">${esc(home)}</a>
<code>HTTP ${status} ${esc(code)}</code>
</main>
</body>
</html>
`;
}
