# T-114: Linha de status diz "Não foi possível salvar" durante o conflito de disco

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: harden do T-038 (2026-11-03)

## Problema
Com a faixa de conflito aberta (T-108), o rodapé também mostra "Não foi possível salvar. O texto continua na tela." e "Tentar de novo". O erro não é de gravação: a página mudou no disco. "Tentar de novo" só reabre a faixa. Dois avisos para o mesmo problema, um deles enganoso.

## Critérios de aceite
- [ ] Com conflito aberto, o rodapé mostra "Aguardando sua escolha" (pt/en), sem o botão "Tentar de novo".
- [ ] Teste do estado; `npm run check`.

## Onde
`web/src/layout/StatusBar.tsx`, `web/src/hooks/useStudio.ts` (expor o estado de conflito em `save`).

## Como verificar
Teste da área; e2e `studio.erros.e2e.ts`.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
