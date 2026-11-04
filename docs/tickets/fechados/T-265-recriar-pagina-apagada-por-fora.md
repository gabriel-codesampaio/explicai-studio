# T-265: Oferecer recriar a página apagada por fora

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: relatório do supervisor do marco 0.4, 2026-11-04 (sobra do T-262)

## Problema
Quando a página aberta é apagada por fora, o Studio avisa e oferece "Copiar meu texto", mas não recria a página.

## Critérios de aceite
- [x] O aviso oferece "Recriar página", com o título e o texto não gravado.
- [x] Teste de unidade do fluxo.

## Registro
Feito (branch feat/t-206-paridade-pt-en):
- O aviso de página apagada por fora ganhou a ação "Recriar página": cria na raiz, com o título e o texto não gravado (ou o último conhecido), e abre.
- "Copiar meu texto" virou o botão secundário do aviso.
- Teste: `web/test/useStudio.test.tsx`.
- Fora: a página volta na raiz, não no pai antigo (o pai pode ter sumido junto).
