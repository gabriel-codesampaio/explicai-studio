# T-534: Título padrão do manual em nanquim, não em preto

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado B4 (Baixo). Relacionado: T-523 (amostras de título em #000000 no escuro), fechado.

## Problema
`web/src/features/settings/ThemeFields.tsx:14` define `heading: "#000000"`. Os cinco campos de título da capa (`12-capa.png`) mostram preto puro, fora da paleta (nanquim `#151a33`).

## Critérios de aceite
- [ ] O padrão de `heading` passa a ser o nanquim da paleta.
- [ ] Manuais que já têm `#000000` gravado continuam iguais; só muda o padrão de manual novo.
- [ ] Testes de tema e de exportação atualizados para o novo padrão.

## Onde
`web/src/features/settings/ThemeFields.tsx:14`. Esforço do relatório: P.

## Como verificar
Teste unitário dos defaults; abrir a Aparência de um manual novo e conferir o campo de título.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
