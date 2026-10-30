# Discovery: landing page com demonstração e GitHub Pages (2026-10-30)

Ideia do caderno (`#marca`, 30/10/2026): "Criar uma Landing Page com uma demonstração do Explicaí, adicionar o github pages".

## Problema
Quem ouve falar do Explicaí (dev solo, software house, redator técnico) não tem onde ver o que ele faz antes de rodar `npx explicai`. Hoje só há o README e o brand book, que mostra a marca, não o produto. Sem página própria, a pessoa decide sem ver um print marcado nem um manual pronto. Hipótese: não há usuário real que confirme esse bloqueio (`PRODUCT.md`, "Evidence on Hand"); a landing também serve de link para o post do blog e para o npm.

## O que já existe
- Brand book publicado em `gabriel-codesampaio.github.io/explicai-brandbook/`: o repositório de marca já usa GitHub Pages. A landing do produto não pode ocupar esse endereço.
- Repositório do Studio: `gabriel-codesampaio/explicai-studio` (`package.json`). Não há `.github/workflows` hoje. Não verifiquei se o repositório está público nem se o Pages está ligado (`gh` não está instalado nesta máquina).
- Exportação HTML pronta: `src/core/export/` (`html.ts`, `fonts.ts`; fontes OFL empacotadas em `fonts/`). Um manual exportado em HTML é a melhor demonstração possível: é o próprio produto. Falta conferir se a pasta `exportacao/` sai autocontida (HTML, imagens e fontes) e funciona sob um subcaminho (`/explicai-studio/demo/`), com links relativos.
- Manual de exemplo: `exemplos/manual-do-financeiro/` tem uma página "sem-titulo" e `assets/` vazio. `exemplos/` está no `.gitignore` (usado só em `dev:server`). Ou seja, **não existe manual de exemplo versionado nem prints**; é preciso criar.
- Marca: `docs/marca-resumo.md` e `Manual/brand/discovery/90_SYNTHESIS.md`. Tokens em `web/src/styles/tokens.css`. Fontes Archivo, Atkinson Hyperlegible Next e JetBrains Mono.
- Posicionamento: hierarquia de mensagem fixa (1. open source e gratuito; 2. do print ao manual pronto; 3. PDF, HTML e Markdown para pessoas e IAs; 4. IA monta pelo MCP). Regra: nunca citar nem comparar com concorrentes. Humor pontual só no site (`90_SYNTHESIS.md`, seção 5): a landing é o lugar permitido.
- Slogan: "Tira o print, que o Explicaí explica.", em português nas duas línguas. Pendência da marca: linha descritiva em inglês (`90_SYNTHESIS.md`, seção 9).

## Como os outros resolvem
Não pesquisei concorrentes: a marca proíbe a comparação e a decisão aqui não depende deles. Não afirmo nada sobre Scribe, Tango, GitBook ou Notion. Padrão de landing de ferramenta de desenvolvedor (hipótese, sem fonte): promessa em uma frase, o comando de instalação copiável, uma demonstração visível sem instalar, link para o repositório.

## Diferença possível
- A demonstração é o próprio produto: um manual exportado pelo Explicaí, navegável na hora, no lugar de um vídeo que envelhece a cada mudança de tela. Se a landing mostra "manual de exemplo feito com o Explicaí", o princípio 1 do produto (o manual acompanha o código) vale para a própria landing: regenerar no build.
- Mostrar o formato aberto: a pasta de Markdown do mesmo manual, ao lado do HTML. É o diferencial 3 ("um manual, dois leitores") visível.

## Opções
| # | Ganho | Tam. | Riscos | Fora |
|---|---|---|---|---|
| **A** | Página estática única (HTML + CSS, sem framework) em `site/`, publicada por GitHub Actions. Proposta, comando `npx explicai`, 3 prints do Studio e **link para um manual de exemplo exportado em HTML** (`site/demo/`, gerado e versionado ou gerado no workflow) | M | Prints e manual de exemplo precisam ser feitos (hoje não existem); subcaminho do Pages; imagem do Studio desatualiza quando a tela muda | Vídeo, GIF, demo interativa do editor, inglês completo, domínio próprio |
| B | A + GIF curto (colar print, numerar, exportar), gravado do Studio real, e versão em inglês em `/en/` | M/G | GIF pesado e envelhece com a interface; segundo idioma dobra a manutenção de texto | Demo interativa, métricas |
| C | Demo interativa do Studio no navegador (build web do editor com manual de exemplo em memória, sem servidor) | G | O editor depende do servidor local (`src/server/`) para ler e gravar; exigiria um backend simulado, risco alto de divergência com o produto | Tudo o que for conteúdo da landing |

## Recomendação: A
Resolve o problema real (ver o produto antes de instalar) com o menor custo e sem mexer no editor nem no formato do manual (nenhuma mudança de dados). A demo "manual exportado" é fiel por construção. Medir depois: cliques no link da demo, estrelas e visitas ao repositório, `npx` rodado (downloads do npm), perguntas que a landing não respondeu. Se a pessoa clica na demo mas não instala, aí GIF (B). Interativa (C) só se muita gente pedir para "experimentar sem instalar", o que contraria o posicionamento local, sem nuvem.

Detalhes de A:
- **Onde:** pasta `site/` no repositório do Studio (não em `docs/`, que é documentação interna). Publicação por **GitHub Actions** (`actions/upload-pages-artifact` e `actions/deploy-pages`), com Pages configurado como "GitHub Actions" nas configurações do repositório. Motivo: o workflow pode rodar `npm run build` e exportar o manual de exemplo para `site/demo/` a cada push na `main`, sem commitar HTML gerado. Alternativa mais simples: commitar o HTML gerado e publicar a pasta; descartada porque envelhece.
- **Endereço:** `https://gabriel-codesampaio.github.io/explicai-studio/`. Domínio próprio fica para depois (INPI e nome ainda em aberto, ver memória do projeto e pendência 4 da síntese).
- **Conteúdo, nesta ordem:** (1) promessa: "Documentar um sistema não pode custar mais que construí-lo." com o slogan; (2) comando `npx explicai manuais` com botão de copiar; (3) os 3 passos (colar o print, marcar, exportar) com um print do Studio cada; (4) "Veja um manual feito no Explicaí" com link para a demo, mais a pasta de Markdown correspondente; (5) PDF, HTML e Markdown, para pessoas e IAs, com uma linha sobre o Agent (MCP); (6) rodapé "um projeto codesampa.io", licença MIT, GitHub, npm.
- **Marca:** papel `#F5F6FA`, nanquim, cobalto só na ação (um botão sólido: copiar comando ou ver demo, não os dois), marca-texto `#FFD43B` só em trecho realçado, números de marcador cobalto, raio 3 px, sem gradiente, sem ícone decorativo, sem robô para falar da IA. A landing é o canal onde o humor pontual cabe, mas só fora de passo e de erro.
- **Acessibilidade:** WCAG 2.2 AA, contraste 4,5:1, foco visível, teclado completo, `alt` com o que o print mostra, `prefers-color-scheme` e `prefers-reduced-motion`. Fontes locais (OFL, já em `fonts/`), sem CDN.
- **Tom:** "você", frase curta, voz ativa, uma ideia por frase, sem "revolucionário", "mágico", "potencializar". Sem depoimento, número de usuário nem "usado por": não há (`PRODUCT.md`). Sem comparação com concorrente. Passar o texto por humanizer antes de publicar.

## Riscos
- **Conteúdo que não existe:** manual de exemplo e prints precisam ser produzidos. Os prints devem mostrar um sistema fictício claramente marcado como exemplo, para não parecerem um cliente real.
- **Formato de dados:** nenhum muda. A landing só consome a exportação existente. Risco indireto: se o HTML exportado não for autocontido ou usar caminho absoluto, a demo quebra no subcaminho do Pages; conferir antes de começar.
- **Conflito com a outra branch:** a landing em `site/` e o workflow em `.github/workflows/` não tocam `web/` nem `src/`, então não colidem com o editor. O workflow que roda o build depende do código do editor compilar na `main`.
- **Publicar o que ainda não saiu:** o `npx explicai` só funciona depois da publicação no npm (T-038, harden antes do npm). A landing não pode sair antes; do contrário o comando principal falha. Rever segurança antes do push e da ativação do Pages (agente `seguranca`).
- **Repositório privado:** Pages em repositório privado exige plano pago. Não verifiquei a visibilidade. Se for privado, a landing espera o repositório ficar público.
- **Idioma:** a marca é bilíngue desde o dia 1; A entrega só português. Disclosed como corte.
- **Manutenção:** prints envelhecem quando o Studio muda. Mitigar com 3 prints e nota no ticket de design do Studio para refazê-los.

## Decisões da pessoa (com recomendação)
1. Endereço inicial: `gabriel-codesampaio.github.io/explicai-studio` ou esperar um domínio? → Usar o do GitHub agora; domínio depois do INPI.
2. Repositório do Studio já é (ou vai ser) público antes da landing? → Sim, a landing sai junto com a publicação no npm.
3. Demo: manual exportado em HTML (A) ou GIF (B)? → A. GIF só se a medição pedir.
4. Qual sistema fictício serve de exemplo? → Manter "Financeiro" (já é o nome da pasta de exemplo e do `manual-format.md`), com 2 ou 3 páginas e 3 prints desenhados à mão ou de um app fictício simples.
5. Inglês na primeira versão? → Não; entra em B. Antes, definir a linha descritiva em inglês (pendência da marca).
6. A landing mostra o Explicaí Agent (MCP)? → Uma linha e um link; o Agent não é ainda o foco da demo.
7. Hospedar em `site/` do Studio ou em repositório separado? → `site/` do Studio: um repositório a menos, o workflow já tem acesso ao build.

## Rascunho de spec (opção A)
- **Escopo:** pasta `site/` com `index.html`, CSS com os tokens da marca e fontes locais. Manual de exemplo "Financeiro" versionado fora de `exemplos/` (que está no `.gitignore`), p. ex. `site/exemplo-manual/`, com 2 ou 3 páginas e prints. Workflow `.github/workflows/pages.yml`: instala, `npm run build`, exporta o manual de exemplo em HTML para `site/demo/`, publica `site/` com `deploy-pages`, em push na `main` que toque `site/**` ou o exportador. README ganha o link da landing. Sem JavaScript além do botão de copiar o comando.
- **Critérios de aceite:**
  - A URL do Pages abre a landing; a demo abre em `/demo/` com imagens, fontes e links funcionando sob o subcaminho.
  - Os 6 blocos existem, na ordem acima, em português; nenhum depoimento, número de uso ou comparação.
  - Um botão sólido por tela; cores só dos tokens; sem gradiente nem ícone decorativo.
  - Contraste AA nos dois temas, foco visível, navegação completa só com teclado, `alt` em todo print (conferir no navegador real com o `testar-interface`).
  - O comando `npx explicai manuais` copia com um clique e funciona (pacote já publicado).
  - Peso total da página abaixo de 1 MB sem a demo (meta, não verificada); sem recurso externo.
  - Texto revisado contra o tom do brand book e humanizado.
  - Nenhum arquivo de `web/`, `src/` ou `manual.json` alterado.
- **Riscos:** os acima. Ordem de trabalho sugerida: (1) conferir que a exportação HTML funciona em subcaminho; (2) criar manual de exemplo; (3) página; (4) workflow; (5) segurança e ativar Pages.
- **Ferramentas que ajudariam (não instaladas por mim):** `conversion-copywriting` (copy da landing), `hallmark` ou `impeccable` (visual), `core-web-vitals` (conferência final). Todas já listadas como disponíveis.

## Não verificado
Visibilidade do repositório; se o Pages está ligado; se a exportação HTML é autocontida e funciona sob subcaminho; como concorrentes montam landing e demo; se alguém realmente trava por não ver o produto antes de instalar.
