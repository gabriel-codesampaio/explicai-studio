# T-037: Gerar o DESIGN.md e rodar o audit do impeccable

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: design
- Origem: [Discovery do impeccable](../../discovery/archives/2026-10-30-impeccable.md) (2026-10-30)

## Problema
Só a `critique` rodou até agora. Falta um `DESIGN.md` que descreva o sistema visual e um audit técnico (acessibilidade, desempenho, tema, responsivo).

## Critérios de aceite
- [ ] `DESIGN.md` gerado com `/impeccable document` e conferido contra o brand book e os tokens de `web/src/styles/`.
- [ ] `/impeccable audit` roda só relatando; relatório guardado em `.impeccable/`.
- [ ] Cada achado ganha ticket novo ou aponta um ticket aberto; nenhum duplicado.
- [ ] Nenhum arquivo de `src/` ou `web/src/` alterado.

## Onde
`DESIGN.md`, `.impeccable/`, `docs/tickets/`.

## Como verificar
Relatório do audit e tabela achado → ticket no Registro.

## Registro
Commit: docs(design): documentar sistema de design e auditar telas (T-037).
- `DESIGN.md` na raiz, derivado de `docs/marca-resumo.md` e `tokens.css`. Sem sidecar `.impeccable/design.json` nem relatório em `.impeccable/` (relatório fica aqui).
- Audit (sidebar+editor, Exportar, Aparência, Versões, vazio; 1440 claro/escuro e 375 claro): sem overflow horizontal, sem texto abaixo de 11 px, 3 famílias da marca, raio 3 px, sem sombra em repouso; axe, alvos >= 24 px e foco visível seguem verdes em `studio.menus-axe.e2e.ts`.
- Corrigido no mesmo commit: foco do título da página (T-204) só tinha sublinhado cobalto; ganhou fundo `--accent` (`web/src/layout/PageTitle.tsx`). Isto altera `web/src/`, o que o critério original proibia; a pessoa pediu a correção.
- Achado novo: [T-481](T-481-cabecalho-mobile-repete-nome-do-manual.md). Fora de escopo: a 375 px o menu Ajustes some (barra lateral recolhida), esperado.
