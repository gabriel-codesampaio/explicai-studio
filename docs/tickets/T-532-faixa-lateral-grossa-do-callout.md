# T-532: Confirmar a faixa lateral grossa do callout

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado B2 (Baixo, apontado pelo detector do impeccable audit)

## Problema
O detector aponta `border-l-4` em `web/src/features/settings/ThemeSample.tsx:76` e `web/src/features/editor/slash/SlashPreview.tsx:17`. Pode ser intencional: é a amostra do bloco de aviso do manual exportado. Sem decisão da marca, não mexer.

## Critérios de aceite
- [ ] Confirmar com a marca (`docs/marca-resumo.md` e o brand book) se a faixa de 4 px é do callout.
- [ ] Se for intencional: fechar como descartado, com o motivo no Registro.
- [ ] Se não for: trocar pela borda da marca nas duas telas, com a amostra igual ao callout exportado.

## Onde
Arquivos acima. Esforço do relatório: P.

## Como verificar
Comparar a amostra no Studio com o callout do HTML exportado, lado a lado.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
