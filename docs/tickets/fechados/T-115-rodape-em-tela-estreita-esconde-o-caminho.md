# T-115: Rodapé em tela estreita perde o caminho do arquivo quando há erro

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: design
- Origem: harden do T-038 (2026-11-03). Sugestão, fica em espera.

## Problema
Abaixo de 500 px o rodapé de erro ("Não foi possível salvar...", "Tentar de novo") reduz o caminho do arquivo a "m…". Não perde dado, só informação.

## Critérios de aceite
- [x] Em 375 px, a mensagem de erro quebra em duas linhas e o caminho mantém ao menos o nome do arquivo.

## Onde
`web/src/layout/StatusBar.tsx`.

## Como verificar
Medir em 375 px com o salvamento falhando.

## Registro
Branch `fix/t-115-rodape-estreito`. StatusBar: abaixo de 500 px o caminho ocupa a linha inteira e o estado/erro desce com quebra; acima, igual a antes. Medido em 375 com erro de salvamento: caminho "m/pages/b.md" inteiro, sem rolagem horizontal; 1280: rodapé 48 px. Sem teste automático (CSS).
