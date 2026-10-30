# Discovery: rodar as outras features do impeccable (2026-10-30)

Ideia do caderno: "rodar as outras features do impeccable".

## Problema
Quem mantém o Studio (a pessoa e a equipe de agentes) só usou a `critique`. Ela mede a experiência pelas heurísticas, não confere o código: contraste medido, foco, toque, i18n, estados de erro. Cada comando do impeccable olha uma coisa. Rodar todos gasta tokens e gera ticket duplicado. A pergunta é quais valem agora e em que ordem.

## O que já existe
- `critique` rodou 4 vezes (`.impeccable/critique/`, 28-29/10). A última deu 26/40, com 1 P0, 2 P1 e P2 em lista. Dela saíram 17 tickets em `docs/tickets/`; 4 já fecharam (`docs/tickets/fechados/`).
- `.impeccable/config.json` guarda uma exceção do detector (`side-tab` em `web/src/styles/editor-content.css`, citação do conteúdo).
- Existe `PRODUCT.md`. **Não existe `DESIGN.md`.** O brand book é externo (ver `CLAUDE.md`, "Marca").
- Regra da pessoa (`~/.claude/rules/economia.md`): no dia a dia `/impeccable audit`; `critique` completa só no fecho de marco.
- Já há `prefers-reduced-motion` em `web/src/styles/base.css:40` e `aria-*`/`role` em 20+ arquivos de `web/src`. A base de acessibilidade existe; falta medir.

## Comandos disponíveis
Lista tirada das instruções da skill impeccable 4.8.0 (tabela "Commands"). Nenhum foi rodado.

| Comando | O que faz | Vale agora? |
|---|---|---|
| `critique` | Revisão de UX com nota | Só no fecho de marco |
| `audit` | Checagem técnica: a11y, performance, tema, responsivo, detector. Só relata, não corrige | **Sim, 1º** |
| `document` | Gera `DESIGN.md` a partir do código | **Sim, antes do audit** (barato, só cria um arquivo) |
| `harden` | Entradas extremas, erros, i18n, texto longo, estados vazios | Sim, antes de lançar |
| `polish` | Passada final antes de entregar | Depois do lote P1 |
| `clarify` | Textos de interface, rótulos, erros | Sim, depois de T-016/T-017/T-028 |
| `onboard` | Primeiro uso, estado vazio, ativação | Já coberto por T-018; ver o discovery do tutorial |
| `adapt` | Outros tamanhos e dispositivos | Não: tickets de celular já cobrem |
| `layout`, `typeset` | Espaço, ritmo, tipografia | Não: T-003/T-004/T-005 já cobrem |
| `distill` | Tirar complexidade | Talvez, depois de T-007/T-008 |
| `extract` | Tokens e componentes para um sistema | Depois do `document`, se o audit achar cor solta |
| `optimize` | Performance de UI | Não, sem sintoma. O audit mede o básico |
| `shape`, `init` | Planejar tela nova; PRODUCT.md | Não: `PRODUCT.md` já existe. `shape` só para tela nova |
| `colorize`, `bolder`, `delight`, `animate`, `overdrive` | Mais cor, ênfase, personalidade, movimento | **Não.** O Studio é ferramenta sóbria; cor e personalidade ficam no manual exportado |
| `quieter` | Baixar o volume | Não: o Studio já é quieto |
| `live`, `generate` | Variantes no navegador | Não: ninguém pediu alternativas visuais |

## O que cada um provavelmente acharia
Tudo abaixo é hipótese, deduzida do código e dos tickets. Só o audit confirma.

- **audit.** A primeira crítica já apontou o que é visível. O audit deve somar o que ela não mede: contraste dos tokens do escuro (T-027), alvos de toque abaixo de 24 px na barra e nos botões de ícone (T-025 toca no assunto), foco visível nos diálogos, ordem de tabulação, cores soltas fora de token, rolagem horizontal em 375 px (T-024). Também roda o detector, que já achou `side-tab` em `ExportDialog.tsx:142` e `PinnedNotice.tsx:10`.
- **harden.** Título de página muito longo na árvore e no "Nesta página" (T-024 é um caso), manual com 200 páginas, nomes com emoji ou acento, API local fora do ar, salvar com a pasta bloqueada, textos sem tradução (T-028 é um caso). Aqui mora o risco de perder conteúdo, mais importante que o visual.
- **polish.** Resto de espaçamento, estados de hover e foco, alinhamento. Só faz sentido depois dos tickets P1, senão ele "poli" o que vai mudar.
- **clarify.** Rótulos como "Versão fixada" x "No manual", "Usar o texto atual" sem confirmação, status em cinza 13 px. Já estão nos tickets T-016, T-017; sobra a revisão do conjunto.

## Já coberto por ticket aberto (não duplicar)
| Assunto | Tickets |
|---|---|
| Tipografia, rótulos, numeração, cabeçalho | T-003, T-004, T-005 |
| Ícones, botão de exportar, menu "/" | T-006, T-007, T-008 |
| Amarelo, marcações, atalhos | T-011, T-012, T-014 |
| Celular e tela dividida | T-013, T-023, T-024, T-025, T-026 |
| Tema escuro | T-027 |
| Textos sem tradução | T-028 |
| Rótulos e status | T-015, T-016, T-017 |
| Título do HTML exportado, imagens | T-002, T-020 |
| Estado vazio e primeiro uso | T-018 |

Regra para os relatórios novos: antes de abrir ticket, procurar o assunto nessa tabela e acrescentar um critério ao ticket existente.

## Referências
Não há concorrente a comparar: é processo interno. Fonte única: a skill impeccable 4.8.0 (instalada em `~/.claude/plugins/cache/impeccable/`).

## Opções
| # | Ganho | Tam. | Riscos | Fora |
|---|---|---|---|---|
| **A** | `document` + `audit` agora. Dá um `DESIGN.md` e um relatório técnico; só o que não estiver em ticket vira ticket | P | `DESIGN.md` gerado pode divergir do brand book externo; relatório repete tickets | Harden, polish, clarify |
| B | A + `harden` agora | M | Mexe em fluxo de salvar e exportar: achados podem ser P0 de dados | Polish, clarify |
| C | Rodar tudo em sequência | G | Duplica ticket, gasta token, e o `polish` age sobre tela que vai mudar | — |

## Recomendação: A, com uma ordem fixa
1. `document` (cria `DESIGN.md`; revisar contra o brand book antes de aceitar).
2. `audit` na `web/src/App.tsx` (o alvo das críticas), sem corrigir.
3. Fechar o lote P1 (T-003 a T-010). Depois `polish` e `clarify`.
4. `harden` antes da próxima versão publicada no npm.
5. `critique` só no fecho do marco, para comparar com os 26/40.

Por quê: o audit é barato, só relata, e cobre o que a crítica não mede. O `harden` é o que mais protege o usuário, mas só rende depois que a interface parar de mudar. Observar: quantos achados do audit são novos (fora da tabela acima). Se menos de uns 3, pular o `polish` separado e ficar com `audit` + `critique`.

## Decisões da pessoa (com recomendação)
1. Gerar o `DESIGN.md` agora? → Sim, e conferir contra o brand book. Sem ele, audit e polish julgam sem referência.
2. O audit corrige ou só relata? → Só relata (o comando já é assim); o supervisor abre ticket.
3. `harden` antes ou depois do lote P1? → Depois, antes da versão pública.
4. Descartar de vez `colorize`, `bolder`, `delight`, `animate`, `overdrive` para o Studio? → Sim, por marca.

## Rascunho de spec (opção A)
- **Escopo:** rodar `document` e `audit` sobre `web/src/App.tsx`; guardar o relatório em `.impeccable/` como as críticas; cruzar cada achado com os tickets abertos; abrir ticket só para o que for novo (P0 a P3 como em `docs/tickets/README.md`). Sem mudar código de produto.
- **Critérios de aceite:**
  - `DESIGN.md` existe e bate com os tokens de `web/src/styles/` e com o brand book.
  - Relatório do audit com nota por dimensão (a11y, performance, tema, responsivo, integridade).
  - Cada achado tem ticket existente ou novo; nenhum ticket duplicado.
  - Nenhum arquivo de `src/` ou `web/src/` alterado.
- **Riscos:** o `DESIGN.md` virar fonte concorrente do brand book; relatório longo gerar ticket a mais do que a fila aguenta; o detector reabrir `side-tab` já ignorado em `config.json`.

Não verificado: o que cada comando acharia de fato (nenhum foi rodado, por regra desta tarefa); a lista de comandos vem da skill instalada, não da documentação online.

## Decisões tomadas (2026-10-30)
- `document` e `audit` agora. → [T-037](../tickets/T-037-design-md-e-audit.md)
- `harden` antes da versão pública. → [T-038](../tickets/T-038-harden-antes-do-npm.md)
