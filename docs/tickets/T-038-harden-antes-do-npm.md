# T-038: Rodar o harden do impeccable antes da versão pública no npm

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: design
- Origem: [Discovery do impeccable](../discovery/2026-10-30-impeccable.md) (2026-10-30)

## Problema
Antes de publicar no npm, a interface precisa aguentar erro, texto longo, idioma, estado vazio e conexão lenta.

## Critérios de aceite
- [ ] Só começa depois do lote P1 (T-003 a T-010) fechado.
- [ ] `/impeccable harden` roda e cada achado vira correção ou ticket.
- [ ] `npm run check` e `npm run test:e2e` passando no fim.

## Onde
`web/src/`.

## Como verificar
Relatório do harden no Registro; e2e verde.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
