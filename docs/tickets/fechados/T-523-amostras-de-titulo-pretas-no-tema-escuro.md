# T-523: Amostras de título em #000000 na Aparência do manual (tema escuro)

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: rodada pesada da 1.0.0, 2026-11-05

## Problema
No tema escuro, as amostras de Título da capa, Título da página e Título 1 a 3 aparecem pretas sobre fundo escuro. Confirmar se é o padrão e dar contraste à amostra.

## Critérios de aceite
- [x] Amostra legível no escuro (borda ou fundo claro de apoio).

## Registro
- Achado na revisão/matriz da 1.0.0; não bloqueia a versão.
- Fechado na branch fix/ultimos-1-0. Medida (escuro, 1280): contraste da amostra #000 com o fundo 1,12:1 -> 21:1 (moldura branca fixa no seletor de cor, valor salvo igual).
