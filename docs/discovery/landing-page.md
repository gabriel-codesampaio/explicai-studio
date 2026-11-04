# Discovery: landing page do Explicaí (2026-11-03)

Complementa [2026-10-30-landing-page.md](archives/2026-10-30-landing-page.md), que já decidiu hospedagem, endereço e conteúdo da opção A. Este documento acrescenta o que faltava: público, promessa, referências de fora, ordem das seções, idioma e um corte mínimo.

## Problema

Dev solo, software house e redator técnico (`PRODUCT.md`) chegam ao Explicaí por um link do blog, do npm ou do GitHub e não têm onde ver, em um minuto, o que ele faz. Hoje só existe o README. A dor que a landing precisa tocar é a do momento: o sistema vai para o ar sem manual, o cliente pede o manual na entrega, ou uma tela muda e o manual fica velho.

Hipótese, sem evidência: que a falta de uma página trave alguém. Não há usuário, depoimento nem número de uso (`PRODUCT.md`, "Evidence on Hand"). A landing é barata o bastante para valer sem essa prova, mas não se deve medir sucesso por conversão ainda.

## Promessa

Uma frase, na ordem fixa da marca: gratuito e open source; do print ao manual pronto; PDF, HTML e Markdown para pessoas e IAs.

- Título: o slogan "Tira o print e explica. O Explicaí monta o manual." (em português nas duas línguas).
- Subtítulo: "Construtor de manuais open source e gratuito. Do print ao manual pronto em PDF, HTML e Markdown." (já é a linha do README).
- Prova concreta no lugar de depoimento: o manual de exemplo exportado, aberto na hora.

## Referências

Fatos vistos nas páginas em 2026-11-03 (WebFetch). Interpretação marcada como tal. A marca proíbe citar concorrente na comunicação pública; isto é só documento interno.

| Referência | O que faz | O que aproveitar | O que evitar |
|---|---|---|---|
| Scribe (scribe.com) | Hero com 5 botões de caso de uso, logos "Fortune 500", números ("12x mais rápido", "7 milhões de pessoas"), depoimentos, segurança, três CTAs finais. Preço só no menu. O texto extraído não mostra print nem demo do produto. | Casos de uso por momento ("onboarding", "SOP") ajudam a pessoa a se reconhecer. | Prova social e números: o Explicaí não tem nenhum, e inventar fere a marca. Página longa de vendas não combina com ferramenta local e gratuita. Hero sem produto visível. |
| Docusaurus (docusaurus.io) | Hero com título e dois botões: "Get Started" e "Try a Demo" (docusaurus.new). Sem comando de instalação na página. Cinco blocos de recursos, vídeo, depoimentos, seletor de idioma na barra (fr, pt-BR, ko, zh). | Dois caminhos claros (ler e experimentar). Seletor de idioma na barra e link "Ajude a traduzir". | Depoimentos (não temos). Vídeo, que envelhece. Não mostrar o comando deixa o dev sem o gesto mais curto. |
| VitePress (vitepress.dev) | Título, subtítulo, três links (o que é, início rápido, GitHub), quatro blocos curtos de recurso, rodapé com MIT. Sem comando na página. Seletor com 8 idiomas na barra. | Enxuta: um hero, quatro blocos, nada mais. Licença MIT no rodapé. Mostra que uma ferramenta dev bem-vista cabe em uma tela e meia. | Hero que só vira `Quickstart` sem mostrar resultado. Para o Explicaí, mostrar o manual pronto é o argumento. |

Leitura (hipótese, minha): as duas referências dev são curtas e vão direto para a documentação; a de produto SaaS é longa e vive de prova social. O Explicaí é dev tool gratuita sem prova social, então segue o formato curto, mas com um diferencial que elas não têm: a demo é um artefato real, navegável.

## Diferença possível

- Comando `npx explicai manuais` visível e copiável na primeira tela (as duas referências dev não mostram comando).
- A demo é o produto: manual "Financeiro" exportado em HTML e a pasta de Markdown ao lado. Isso mostra o "um manual, dois leitores" sem texto de venda.
- Humor pontual cabe aqui (`90_SYNTHESIS.md`, seção 5), nunca em passo ou erro.

## Seções, em ordem

1. **Cabeçalho.** Logo, links (Demo, GitHub, npm), troca de idioma. Objetivo: orientar sem competir com o hero.
2. **Hero.** Slogan, subtítulo, comando `npx explicai manuais` com botão de copiar, link secundário "Ver um manual pronto". Objetivo: a pessoa entende o que é e já tem o gesto de instalar.
3. **Print do Studio com marcadores.** Uma imagem do editor com um print marcado (números cobalto). Objetivo: ver o produto antes de ler.
4. **Três passos.** Colar o print, marcar, exportar, um print por passo. Objetivo: mostrar o fluxo, na ordem em que a pessoa usa (princípio 4).
5. **Um manual, dois leitores.** Duas colunas: o HTML/PDF aberto e a pasta de Markdown. Uma linha sobre o Agent (MCP) com link. Objetivo: diferencial de formato aberto, versionado no git.
6. **Para quem e quando.** Três momentos, em frases curtas: sistema no ar sem manual, cliente pedindo na entrega, tela que mudou. Sem depoimento. Objetivo: a pessoa se reconhece.
7. **Gratuito e aberto.** MIT, roda local, sem login e sem nuvem. Objetivo: tirar a objeção de custo e privacidade.
8. **Rodapé.** "Um projeto codesampa.io", licença, GitHub, npm, blog, brand book.

Seções 6 e 7 podem fundir em uma na primeira versão.

## CTA principal

O comando `npx explicai manuais`, com botão de copiar. Motivo: o público é dev e o produto é local; copiar o comando é a conversão. Secundário: "Ver um manual pronto" (demo). Só um botão sólido por tela (regra da marca): o de copiar. A demo vai como link.

GitHub fica no cabeçalho e no rodapé, não como CTA de topo. Ainda não há estrelas para exibir e não se deve exibir contador vazio.

## Bilíngue?

Recomendo português primeiro, com inglês logo depois, não junto no dia 1.

- A marca é bilíngue desde o início, e as referências dev têm seletor de idioma na barra (Docusaurus, VitePress). O README já tem um parágrafo em inglês.
- Mas falta a linha descritiva em inglês (pendência 9 da síntese) e o inglês dobra a manutenção.
- Meio-termo barato: `index.html` em português e `en/index.html` com o mesmo layout e só o texto trocado, quando a linha em inglês estiver aprovada. Sem framework de i18n; duas páginas estáticas.
- O slogan fica em português nas duas.

## Onde hospedar

GitHub Pages, no repositório do Studio, pasta `site/`, publicado por GitHub Actions. O detalhamento está na discovery anterior. Endereço inicial: `gabriel-codesampaio.github.io/explicai-studio/`. Domínio próprio fica para depois da checagem de nome (INPI).

Estado hoje: remoto `origin` é `gabriel-codesampaio/explicai-studio`; não existe `site/`; `package.json` está em 0.1.0 e o T-038 (harden antes do npm) está aberto. Não verifiquei se o repositório é público nem se o Pages está ligado.

## Opções

| # | Ganho | Tam. | Riscos | Fora |
|---|---|---|---|---|
| **A (corte mínimo)** | Uma página em português: hero com comando, 1 print, 3 passos, link para a demo, rodapé. Estática, sem framework, fontes locais. Demo gerada no workflow. | M | Print e manual de exemplo não existem e precisam ser feitos; comando só funciona após publicar no npm; subcaminho do Pages | Inglês, GIF, seção "para quem", domínio |
| B | A + seções 5 a 7 completas + `en/` + meta tags e imagem social | M/G | Texto em inglês depende da linha descritiva aprovada; dobra a manutenção | GIF, demo interativa |
| C | B + GIF do Studio e demo interativa no navegador | G | Interativa exige backend simulado e diverge do produto; GIF envelhece | n/a |

## Recomendação: A, e B quando o npm estiver publicado

A resolve o problema (ver o produto e copiar o comando) sem mexer em `src/`, `web/` nem no formato. Observar depois: downloads no npm, visitas à demo, estrelas, perguntas que a página não respondeu. Se a demo é aberta e ninguém instala, o problema está no hero ou no `npx` (pensar em GIF). Se pedem inglês, B.

## Esforço e riscos

- Esforço: A em M (cerca de 2 a 3 fatias: manual de exemplo e prints; página; workflow). B soma uma fatia de texto em inglês.
- Publicar antes do npm: o botão principal falharia. A landing só vai ao ar depois do T-038 e da publicação.
- Conteúdo que não existe: manual de exemplo e prints. Sistema fictício, marcado como exemplo.
- Exportação HTML sob subcaminho: não verificado. Se usar caminho absoluto, a demo quebra. Conferir primeiro.
- Prova social: não inventar. A página funciona sem ela.
- Tom: passar a copy por humanizer e conferir contra o brand book. Sem "revolucionário", "mágico".
- Segurança: agente `seguranca` antes de ligar o Pages e do push do workflow.
- Formato de dados: nenhum muda.

## Perguntas para a pessoa

1. Repositório do Studio vai ser público antes da landing? Recomendo sim, na mesma semana da publicação no npm.
2. Inglês no dia 1 ou depois? Recomendo depois (B), e antes definir a linha descritiva em inglês.
3. Posso usar o comando `npx explicai manuais` como CTA único do hero? Recomendo sim; a demo vira link.
4. Sistema fictício do exemplo: mantém "Financeiro"? Recomendo sim.
5. Mostrar o Agent (MCP) na landing? Recomendo uma linha com link, até o `explicai-mcp` ter versão publicada.
6. Link para o blog (codesampa.io) no cabeçalho ou só no rodapé? Recomendo rodapé; o post inicial ainda nem saiu.

## Rascunho de spec (opção A)

- **Escopo:** pasta `site/` com `index.html` em português, CSS com os tokens da marca (`web/src/styles/tokens.css`) copiados ou referenciados, fontes locais de `fonts/`. Seções: cabeçalho, hero com comando e botão de copiar, 1 print do Studio, 3 passos, link para a demo, rodapé. Manual de exemplo "Financeiro" versionado fora de `exemplos/` (que está no `.gitignore`), exportado em HTML para `site/demo/` no workflow `.github/workflows/pages.yml`. README ganha o link da landing. JavaScript só no botão de copiar.
- **Critérios de aceite:**
  - A URL do Pages abre a landing; a demo abre em `/demo/` com imagens, fontes e links funcionando no subcaminho.
  - O comando `npx explicai manuais` copia com um clique e roda (pacote publicado).
  - Um botão sólido por tela; cores só dos tokens; sem gradiente, sem ícone decorativo, sem depoimento, número de uso ou comparação.
  - WCAG 2.2 AA nos dois temas, foco visível, teclado completo, `alt` descrevendo cada print, `prefers-reduced-motion` respeitado.
  - Sem recurso externo (fontes e scripts locais).
  - Texto revisado contra o brand book e humanizado.
  - Nenhum arquivo de `web/`, `src/` ou `manual.json` alterado.
- **Riscos:** os acima. Ordem sugerida: (1) conferir que a exportação HTML funciona em subcaminho; (2) manual de exemplo e prints; (3) página; (4) workflow; (5) segurança e ativar o Pages.
- **Agentes:** `design` (página e prints), `frontend` (HTML/CSS), `qa` (teclado, contraste, subcaminho), `seguranca` (Pages e workflow). Skills de apoio, já listadas: `conversion-copywriting`, `hallmark` ou `impeccable`, `core-web-vitals`.

## Não verificado

Visibilidade do repositório e estado do Pages; se a exportação HTML funciona em subcaminho; o conteúdo visual das referências (o extrator não retornou imagens); se alguém trava por não ver o produto antes de instalar.
