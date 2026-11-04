# T-241: Ponto do item de rádio colide com o marcador próprio do item

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa, 2026-11-04 (lote 1.0)

## Problema
`dropdown-menu.tsx` desenha um ponto no item de rádio marcado e reserva `pl-8`. O StatusMenu tem a própria bolinha e check, e contornava o ponto com `[&>span:first-child]:hidden`. (Medido: o ponto só aparece no item marcado, não em todos; a colisão é com a bolinha da etapa.)

## Critérios de aceite
- [x] O componente permite item sem ponto nem recuo padrão, sem hack de CSS no consumidor.
- [x] StatusMenu usa isso e fica igual.

## Registro
