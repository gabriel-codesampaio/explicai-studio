# Discovery: mini tutorial guiado para o cliente (2026-10-30)

Complementa o ticket [T-018](../tickets/T-018-primeiro-print.md) (página vazia que ensina o primeiro print).

Ideia do caderno: "um mini tutorial pro cliente, utilizando o driverjs.com ou alguma solução parecida, ensinando ele como fazer um manual e exportar".

## Problema
Quem abre o Studio pela primeira vez (dev ou software house que roda `npx explicai`) não sabe qual é o caminho: criar página, colar um print, numerar o clique, exportar. Hoje faz sem ajuda; o que sabe vem do README. A crítica de design deu 2/4 em "Ajuda" por não haver onboarding do primeiro passo. Hipótese: ainda não há usuário real que confirme o tropeço (`PRODUCT.md`, "Evidence on Hand").

## O que já existe
- Estado vazio: `web/src/components/EmptyState.tsx` (título, texto, um botão), usado em `web/src/App.tsx:44`. Texto neutro.
- T-018 pede que a página vazia ensine "cole um print (Ctrl+V) e numere o clique", em pt e en, sem humor. Tamanho P.
- Ajuda de atalhos: `web/src/features/help/ShortcutsDialog.tsx`, aberto da barra lateral (`Sidebar.tsx:108`).
- Preferências no navegador já usam `localStorage` (`web/src/lib/i18n.ts`, `theme.ts`, `hooks/useSidebar.ts`). Dá para guardar "tutorial visto" do mesmo jeito, sem tocar no formato do manual.
- i18n: `web/src/lib/i18n.ts` e `i18n.en.ts` (T-028 mostra que ainda escapam textos sem tradução).
- Hoje as dependências de produção são `marked` e `yaml`; o editor entra pelo Vite como devDependency.

## Como os outros resolvem
Dados dos repositórios e da documentação; o que não apareceu na página está marcado como não verificado.

| Biblioteca | Licença | Peso | Teclado e leitor de tela | i18n | Fonte |
|---|---|---|---|---|---|
| **driver.js** | MIT | ~5 KB gzip, sem dependências | Teclado controla tudo (`allowKeyboardControl`, padrão ligado). Só a opção `closeBtnLabel` para leitor de tela; foco e ARIA dos popovers não documentados | Textos dos botões e do progresso configuráveis (`nextBtnText`, `prevBtnText`, `doneBtnText`, `progressText`) | [GitHub](https://github.com/kamranahmedse/driver.js), [configuração](https://driverjs.com/docs/configuration) |
| **Shepherd.js** | **AGPL-3.0 ou comercial** (comercial obrigatório para produto comercial, a partir da v14; versões anteriores eram mais livres) | Não verificado | Não verificado | Não verificado | [GitHub](https://github.com/shipshapecode/shepherd), [DeepWiki](https://deepwiki.com/shipshapecode/shepherd/7-licensing-and-commercial-usage) |
| **Intro.js** | **AGPL-3.0 ou comercial** | Não verificado | Não verificado | Não verificado | [GitHub](https://github.com/usablica/intro.js) |
| **React Joyride** | MIT | Não verificado (v3 diz ser ~30% menor que a v2) | Declara foco preso, teclado e ARIA | Não verificado | [GitHub](https://github.com/gilbarbara/react-joyride) |

Descartadas pela regra do projeto (sem GPL/AGPL nem licença comercial): Shepherd e Intro.js. Não pesquisei outras (Reactour, OnboardJS etc.): não são necessárias, já há duas MIT.

Padrão dos concorrentes de manual (Scribe, Tango): não encontrei passeio guiado em doc oficial; não afirmo nada. Para o tutorial, o que vale é o padrão do produto: **ensinar no lugar onde o conteúdo vai ficar**.

## Diferença possível
- O produto ensina a fazer manual; o melhor tutorial é um manual de exemplo. Já existe `./exemplos` (usado por `npm run dev:server`), então o primeiro uso pode abrir o Studio já com um manual curto que ensina o caminho. A hipótese precisa ser conferida no código antes de assumir.
- Sem popover nem destaque na tela: menos peso, menos a11y para manter, nenhuma dependência.

## Opções
| # | Ganho | Tam. | Riscos | Fora |
|---|---|---|---|---|
| **A** | Estado vazio que ensina (T-018, que já existe) + uma linha de ajuda persistente ("Como exportar") no estado vazio e no menu de ajuda. Sem biblioteca | P | Quem ignora o texto não aprende; não leva a pessoa ao botão Exportar | Passeio guiado, destaque na tela |
| B | A + passeio de 3 a 4 passos com **driver.js** (nova página, colar print, numerar, exportar), mostrado uma vez e reabrível pelo menu de ajuda | M | Dependência nova (MIT, ~5 KB); popovers com a11y limitada, a conferir; textos pt/en passados por config; destaque some se o elemento sair (menu "/", diálogo) | Tutorial adaptável, vídeo, métricas |
| C | B com **React Joyride** (a11y declarada) | M/G | Dependência maior, API de React com estado próprio; não verifiquei o peso | Idem B |

## Recomendação: A
O corte mínimo é o T-018, que já descreve o primeiro passo e não pede dependência. Ele só falta cobrir o fim do caminho (exportar). Acrescentar ao T-018 um critério para o estado vazio/ajuda mencionar a exportação, e **medir antes de subir para B**: se, nos primeiros usos, a pessoa travar em "onde exporto?" ou "como numero?", aí vale o driver.js (opção B). Pontos a observar: abre o Studio e fica parada em página vazia; abre um issue com a pergunta; não encontra "Exportar" (o T-006 já leva o botão ao topo, o que pode resolver sozinho).

Se a opção B for aprovada, driver.js é a escolha: MIT, menor, sem dependência, textos configuráveis. Antes de integrar, um teste em navegador real: foco entra no popover? leitor anuncia o título? `Esc` fecha? Se falhar, trocar por Joyride ou voltar a A.

## Riscos
- **Licença:** só MIT. Shepherd e Intro.js saem. Conferir a licença da versão exata instalada.
- **Acessibilidade:** é critério do projeto (WCAG AA no `PRODUCT.md`). O driver.js documenta teclado, não ARIA nem foco; testar com teclado e leitor antes de entregar.
- **Marca:** popover padrão do driver.js tem cara própria; precisa de `popoverClass` com tokens do Studio, sem cor nova.
- **Manutenção:** mais um bloco de textos pt/en que podem escapar da tradução (T-028).
- **Formato:** nenhum. O "tutorial visto" fica no `localStorage`, não no `manual.json`.

## Decisões da pessoa (com recomendação)
1. Começar só com o T-018 ampliado, sem biblioteca? → Sim.
2. Quem é o "cliente" do tutorial: o dev que roda o Studio, ou quem recebe o manual exportado? → O dev que roda o Studio. Quem lê o manual exportado não precisa de tutorial de edição.
3. Se subir para B, driver.js? → Sim, com teste de teclado e leitor de tela antes.
4. Abrir o Studio pela primeira vez já com um manual de exemplo que ensina o caminho? → Verificar no código se há como; a ideia é boa e não pede dependência.

## Rascunho de spec (opção A, extensão do T-018)
- **Escopo:** estado vazio (página sem conteúdo, manual sem páginas) com os dois passos do caminho: colar print com Ctrl+V e numerar o clique; e uma linha que aponta onde exportar. Mesmo texto no menu de ajuda. Textos em pt-BR e en no tom do brand book ("você", uma ideia por frase, botão diz o que acontece).
- **Critérios de aceite:**
  - Página vazia mostra os passos; some quando houver conteúdo.
  - A linha sobre exportação aparece e leva ao botão (ou o abre).
  - Textos existem em `i18n.ts` e `i18n.en.ts`; teste de i18n passa.
  - Usável só com teclado; contraste AA nos dois temas.
  - Nada de dependência nova; `manual.json` e Markdown inalterados.
- **Riscos:** texto longo demais para o estado vazio; competir com o T-006 pela atenção ao botão Exportar.

Não verificado: peso real e acessibilidade dos popovers do Shepherd, Intro.js e Joyride; se o driver.js move o foco para o popover; se há usuário que trava hoje.

## Decisões tomadas (2026-10-30)
- Sem biblioteca: o T-018 foi ampliado para mostrar também onde exportar.
- Público: quem monta o manual no Studio.
