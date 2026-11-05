# T-424: Foco não volta ao botão depois de fechar menu ou diálogo

- Prioridade: P1
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: 2026-11-04, relatório do lote de medição. E2E da main vermelho desde o #106 (T-173); verde no #104.

## Problema
Desde que o fundo fica `inert` com menu ou diálogo aberto (`web/src/lib/inertWhenHidden.ts`, T-173), o foco não volta ao gatilho ao fechar. Quem usa teclado perde o lugar. Falham `studio.e2e.ts:255`, `:589`, `:646` e `studio.lote6.e2e.ts:4` (`toBeFocused`: Received inactive).

## Critérios de aceite
- [ ] Ao fechar menu ou diálogo, o foco volta ao gatilho; os 4 e2e passam.
- [ ] O fundo continua fora do Tab enquanto o menu está aberto (axe sem `aria-hidden-focus`), ou, se as duas coisas não couberem juntas, foco de volta ganha e o T-173 reabre com o motivo.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
