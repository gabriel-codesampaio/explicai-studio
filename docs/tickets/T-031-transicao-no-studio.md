# T-031: Transição curta ao trocar de página no Studio

- Prioridade: P3
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: [Discovery de transições](../discovery/2026-10-30-transicoes.md) (2026-10-30)

## Problema
A troca de página na árvore do Studio é seca. A pessoa quer uma transição suave, só no Studio; o manual exportado não ganha animação.

## Critérios de aceite
- [ ] Antes de construir: medir o tempo entre o clique na árvore e o editor aceitar digitação, numa página de ~50 blocos. Se a transição somar mais de ~100 ms, parar e voltar para a pessoa.
- [ ] Fade de no máximo 150 ms com `document.startViewTransition`, sem dependência nova.
- [ ] `flush` do salvamento automático termina antes de a transição começar.
- [ ] Sem a API (Firefox e Safari antigos), a troca é igual à de hoje.
- [ ] Com `prefers-reduced-motion: reduce`, nenhuma transição inicia.
- [ ] O manual exportado (HTML e PDF) não muda.

## Onde
`web/src/lib/` (função `withTransition`, sem React), `web/src/hooks/useStudio.ts` (`selectPage`), `web/src/styles/base.css`.

## Como verificar
Teste unitário do `withTransition` com e sem a API (happy-dom); e2e que troca de página e confere o conteúdo; medição de tempo registrada no Registro.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
