# Discovery: transições suaves entre as páginas (2026-10-30)

Relacionado: [impeccable](2026-10-30-impeccable.md) descartou o comando `animate` por marca.

Ideia do caderno: "Adicionar transições suaves entre as páginas" (#produto #app).

## Problema
Quem edita um manual no Studio troca de página várias vezes por sessão. Hoje a troca é seca: o conteúdo some e o outro aparece. Quem lê o manual exportado pula entre seções pelo sumário. Hipótese: nenhum dos dois reclamou disso. É acabamento, não dor. Nenhum usuário real confirma (PRODUCT.md, "Evidence on Hand").

## Duas leituras
- **Studio** (trocar de página na árvore). Há uma chance real de dar certo, mas é onde a marca pesa contra.
- **Manual exportado** (sumário). Não há "troca de página": o HTML é um documento só, com uma `<section>` por página e links de âncora (`src/core/export/html.ts:37-42`, `:171`). O que existe é rolagem. "Transição" aqui é rolagem suave.

## O que a marca diz sobre movimento
- O brand book não trata de movimento, animação, transição nem reduced motion. Conferi a página inteira ([brand book](https://gabriel-codesampaio.github.io/explicai-brandbook/)); a palavra não aparece.
- `docs/marca-resumo.md` também não. Diz "calmo, preciso, didático; nada de enfeite" e "ícone decorativo sai".
- O discovery do impeccable descartou `animate` porque "o Studio é ferramenta sóbria; cor e personalidade ficam no manual exportado".

Reconciliação: a marca é omissa, não proíbe. O que `animate` traz (movimento como personalidade) fica fora. Uma transição que mostra que a página mudou, em ~150 ms, sem deslocamento, é feedback, não enfeite. Regra proposta: movimento só se informa estado, é curto, e some com `prefers-reduced-motion`. Vale registrar isso no `docs/marca-resumo.md` se a pessoa aprovar.

## O que já existe
- Troca de página: `selectPage` (`web/src/hooks/useStudio.ts:81`) faz `await flush()` e depois `showPage` (`:45`), que busca a página (`api.getPage`), chama `setPage` e escreve o hash.
- Roteamento por hash: `web/src/lib/hashRoute.ts`. Só lê no boot (`readLocation`) e escreve com `replaceState` (`:15`). Não escuta `hashchange` e não cria entrada no histórico. Ou seja, não há navegação do navegador para interceptar: a troca é 100% estado do React.
- Salvar: `useAutosave` (`web/src/hooks/useAutosave.ts`) grava 600 ms depois da última edição. `flush` roda antes de trocar de página, para nada ficar para trás. A troca já espera a gravação.
- `PageView` (`web/src/layout/PageView.tsx`) monta o Tiptap por página. Remontar o editor é o custo real da troca, não o CSS.
- `prefers-reduced-motion` já zera `animation-duration`, `transition-duration` e `scroll-behavior` em `web/src/styles/base.css:40-46`. Isso cobre CSS, não cobre `startViewTransition` (é API de JS, mas a animação dela é CSS, então `animation-duration: 0.01ms` a encurta; ver riscos).
- Export: não há `scroll-behavior` nem script em `html.ts`. O PDF sai do mesmo HTML; `@media print` (`html.ts:205-211`) quebra por página.
- Dependências: React `^19.3.1`, Vite 8. Nenhuma biblioteca de animação.

## Referências
| Fato | Fonte |
|---|---|
| View Transitions de mesmo documento: Chrome/Edge 111, Safari 18.0, Firefox 144 (143 desativado por padrão). Uso global 92,9% | [Can I use](https://caniuse.com/view-transitions) |
| Entre documentos (`@view-transition`): Chrome/Edge 126, Safari 18.2, Firefox não suporta. Exige mesma origem | [Chrome for Developers](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document) |
| `document.startViewTransition()` é a API do mesmo documento; `@view-transition` é a do entre documentos | [MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) |
| Concorrentes (Scribe, Tango, GitBook, Confluence, Notion): não pesquisei transição de página neles | hipótese: nenhum faz questão disso |

Não verifiquei: se `@view-transition` funciona em `file://` (a fonte não diz; o manual exportado costuma ser aberto assim). Não é necessário: o export é um documento só.

## Viabilidade técnica
- **Studio, mesmo documento: viável sem dependência.** `document.startViewTransition(cb)` é nativo. Funciona com o hash porque o hash não participa: a troca é estado.
- **React 19:** a callback precisa terminar a atualização do DOM de forma síncrona. Padrão: buscar a página antes, depois `startViewTransition(() => flushSync(() => setPage(p)))`. Se a busca ficar dentro da callback, a tela congela (a API tira um retrato e bloqueia a pintura até a promessa resolver).
- **Remontagem do Tiptap** dentro da callback é pesada. Página grande pode estourar o orçamento e a transição perder a graça, ou pior, travar ~100 ms. Medir antes.
- **Entre documentos:** não se aplica ao Studio (é SPA) nem ao export (um documento só).
- **Fallback:** sem `startViewTransition` (Firefox < 144, Safari < 18), chama a troca direto. Sem regressão.
- **Reduced motion:** checar `matchMedia("(prefers-reduced-motion: reduce)")` e pular a API. Mais seguro que depender só do CSS global.
- **PDF:** não tem transição. `@media print` e `scroll-behavior` não afetam. Sem risco, e vale ter um critério para provar.

## Desempenho e salvamento automático
- `flush` continua antes de tudo, fora da transição. Ordem: `flush` → busca → transição → troca. A transição nunca roda antes da gravação terminar, então não adia nem corta o salvamento.
- Risco real: a pessoa digita enquanto a transição roda. Durante a animação a página antiga é um retrato e não recebe entrada. Com 150 ms o efeito é desprezível; com 300 ms ou mais, tecla perdida. Por isso o teto.
- Se `flush` falhar (estado `error`), hoje a troca segue? Não verifiquei o fluxo de erro em `selectPage`; `run` captura e mostra toast. Manter: transição só depois de `flush` com sucesso.
- Custo extra: um retrato da tela por troca. Desprezível em tela comum.

## Opções
| # | Ganho | Tam. | Riscos | Fora |
|---|---|---|---|---|
| **A** | Manual exportado: rolagem suave ao clicar no sumário, só com `prefers-reduced-motion: no-preference`. Uma linha de CSS | P | Quase nenhum. Rolagem longa (200 páginas) pode cansar; o salto de âncora curto fica suave | Studio |
| B | A + Studio: fade curto (~150 ms) na troca de página com `startViewTransition`, com fallback e reduced motion | M | Remontagem do Tiptap travando; tecla perdida; `flushSync`; ponto de partida para pedidos de mais movimento | Cross-document, animação de lista, slide lateral |
| C | B + movimento na árvore (expandir/recolher) e nos painéis | G | Contraria a linha sóbria; mais código de movimento para manter | — |

## Recomendação: A agora, B só depois de medir
Por quê: A custa uma linha, não toca em React e pertence ao manual exportado, onde a marca já manda a personalidade. O Studio é ferramenta de trabalho; trocar de página rápido vale mais que animar. B pode entrar se o fade medir abaixo de 150 ms sem atrasar a edição.

Observar: tempo entre o clique e o cursor pronto no editor, com e sem transição, numa página de ~50 blocos. Se passar de ~100 ms de piora, B não vale. Pedido real de usuário também pesa.

## Decisões da pessoa (com recomendação)
1. Qual leitura vale: Studio, export ou ambas? → Export agora (A). Studio só se o teste de tempo passar.
2. Registrar no `docs/marca-resumo.md` a regra "movimento só informa estado, até 150 ms, respeita reduced motion"? → Sim, em uma linha. Sem isso cada ticket rediscute `animate`.
3. A rolagem suave do export vale também para o PDF? → Não se aplica; `@media print` não muda.
4. Aceitar que Firefox antigo e Safari antigo fiquem sem transição no Studio? → Sim, o fallback é a troca de hoje.
5. Aceitar nenhuma dependência nova (sem Motion, sem react-transition-group)? → Sim.

## Rascunho de spec (opção A)
- **Escopo:** em `src/core/export/html.ts`, dentro do CSS embutido, `@media (prefers-reduced-motion: no-preference){html{scroll-behavior:smooth}}`. Testar o HTML gerado. Registrar a regra de movimento em `docs/marca-resumo.md` (se aprovado).
- **Critérios de aceite:**
  - O HTML exportado contém a regra só dentro de `no-preference`.
  - Com reduced motion ligado, clicar no sumário salta sem animação.
  - O PDF sai idêntico ao de hoje (quebras de página e capa).
  - O Markdown e o `manual.json` não mudam. Sem `FORMAT_VERSION` novo.
  - Âncora cai no título certo (`scroll-margin-top` em `html.ts:171` continua valendo).
- **Riscos:** o Chromium headless do PDF ignorar ou obedecer a rolagem suave (testar a exportação do PDF); a tabela de contraste e o resto do CSS não mudam.

## Rascunho de spec (opção B, se medir bem)
- **Escopo:** função `withTransition(update)` em `web/src/lib/` (sem React): usa `startViewTransition` se existir e se `prefers-reduced-motion` não for `reduce`; senão chama `update()`. `selectPage` busca a página, depois `withTransition(() => flushSync(() => setPage(p)))`. CSS: `::view-transition-old(root),::view-transition-new(root){animation-duration:150ms}`.
- **Critérios de aceite:**
  - `flush` termina antes de qualquer transição começar.
  - Sem `startViewTransition`, a troca é igual à de hoje.
  - Com reduced motion, nenhuma transição inicia.
  - Troca em página de ~50 blocos: o editor aceita digitação em até 100 ms a mais que hoje.
  - Teste unitário do `withTransition` (happy-dom, com e sem a API) e um e2e que troca de página e confere o conteúdo.
- **Riscos:** Tiptap remontando dentro da callback; tecla perdida; `flushSync` fora de evento do React.

Não verificado: comportamento no Safari e no Firefox; custo real no Studio (nenhuma medição feita); concorrentes.
