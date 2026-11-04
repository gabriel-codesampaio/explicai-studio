# T-038: Rodar o harden do impeccable antes da versão pública no npm

- Prioridade: P2
- Tamanho: M
- Status: fechado
- Agente: design
- Origem: [Discovery do impeccable](../../discovery/2026-10-30-impeccable.md) (2026-10-30)

## Problema
Antes de publicar no npm, a interface precisa aguentar erro, texto longo, idioma, estado vazio e conexão lenta.

## Critérios de aceite
- [x] Só começa depois do lote P1 (T-003 a T-010) fechado.
- [x] `/impeccable harden` roda e cada achado vira correção ou ticket.
- [x] `npm run check` e `npm run test:e2e` passando no fim.

## Onde
`web/src/`.

## Como verificar
Relatório do harden no Registro; e2e verde.

## Registro
Branch `fix/t-038-harden` (eacac2d, 40a9339, ea548c2). `/impeccable harden` no Studio (web/src), com servidor temporário e Chrome DevTools.

Já resistente: servidor fora (banner + reconexão + regravação ao voltar, medido), 404/500/403, ErrorBoundary, erro de gravação mantém o texto, erros do editor de marcação.

Corrigido:
- Título longo ficava cortado ao carregar (altura medida antes da fonte). `PageTitle.tsx` remede ao carregar a fonte e ao mudar a largura. Medido: 217/217 px.
- Trocar a fonte do manual (barra e diálogo Exportar) falhava calado. `FontMenu.tsx`, `ThemeFields.tsx` mostram o erro.
- Conflito de disco (T-108): toast estreito, botões de 24 px a 12 px, nenhum dizia a consequência. Virou faixa fixa (`DiskConflictBanner.tsx`), botões de 32 px (44 px no toque), contraste 16,2:1, texto pt/en com a consequência de cada botão.
- "Recarregar do disco" descartava o rascunho antes de ler o disco: se a leitura falhasse, perdia o texto e a faixa ficava sem saída. Agora lê primeiro (`useStudio.ts`), com teste.
- Conflito não gera mais toast de erro duplicado; faixa de conexão agora fixa no topo.

Tickets novos: T-114 (rodapé mente no conflito), T-115 (rodapé em tela estreita, em espera).

Verificação: vitest 477 verdes, lint e tipos limpos, e2e `studio.erros` 11/11. Matriz completa não rodada (tema claro não aplicou; janela mínima de 500 px).
