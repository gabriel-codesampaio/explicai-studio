# T-009: Raio de 3 px na interface de trabalho

- Prioridade: P1
- Status: feito
- Agente: design
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
Todo componente usa `--radius: 6px` (raio igual em tudo é sinal de interface gerada). O brand book usa canto quase reto e reserva o arredondado para o símbolo.

## Critérios de aceite
- [x] Raio base da interface em ~3 px (campos, menus, diálogos, cards da exportação).
- [x] Prints, ícone da marca e marcadores redondos continuam como estão.
- [x] Nenhum componente com raio solto fora dos tokens.

## Onde
`web/src/styles/tokens.css` (`--radius`), componentes com `rounded-*` fixo.

## Como verificar
Prints antes e depois; busca por `rounded-` fora dos tokens.

## Registro
Commits: o `style(ui): troca o raio da interface por 3 px vindo só do token` e o commit que fecha este ticket.

O que foi feito: `--radius: 3px` em `web/src/styles/tokens.css`, e `--radius-xs` a `--radius-xl` viraram apelidos dele, para que qualquer `rounded-*` do shadcn caia no mesmo raio. Os `rounded-[2px]` e os `rounded` sem sufixo (o Tailwind 4 grava 0.25rem direto) passaram a `rounded-sm`. A seta do tooltip ficou sem raio, para a ponta não ficar cega.

Exceções de propósito: círculos (`rounded-full`, `50%`); destaque e área clicável das marcações (`rounded-[3px]`, iguais ao `.hl`/`.hot` do export); raios do conteúdo no editor (código 4 px, pre 8 px, citação do passo 6 px, print 8 px), que espelham `src/core/export/html.ts`. O print dentro do diálogo de marcação fica com 3 px por ser superfície de trabalho.

Busca de raio solto: `grep -rnE "rounded-\[[^]]*\]|rounded(\s|\"|')|border-radius:\s*[^;]*[0-9]+(px|rem|em)" web/src --include=*.tsx --include=*.ts --include=*.css` traz só as exceções acima.

Verificação: o qa mediu o raio calculado de todos os elementos visíveis em cinco telas (página, Exportar, menu "/", Ctrl+P, marcação): interface toda em 3 px, fora das exceções. `npm run check` (94 testes) e `npm run test:e2e` (12) verdes. Prints depois em `C:/Users/PC/explicai-prints/p1/T-009/` (todas as telas, 375/960/1440, claro e escuro).

Decisão para a pessoa confirmar: o desenho do Studio dentro do brand book publicado usa 6 px (`.lateral div`, `.btn-fake`, `.busca`), e janelas e cartões usam 10 a 12 px; o 3 px veio da crítica de design. Mantive o 3 px do ticket. Se o brand book continuar com 6 px, basta voltar `--radius` (a unificação num raio só continua valendo). Atualizar o brand book fica com a pessoa.

Ficou de fora: o manual exportado mantém os raios dele (4, 6 e 8 px).
