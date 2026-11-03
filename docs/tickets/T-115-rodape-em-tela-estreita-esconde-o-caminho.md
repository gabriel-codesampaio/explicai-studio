# T-115: Rodapé em tela estreita perde o caminho do arquivo quando há erro

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: design
- Origem: harden do T-038 (2026-11-03). Sugestão, fica em espera.

## Problema
Abaixo de 500 px o rodapé de erro ("Não foi possível salvar...", "Tentar de novo") reduz o caminho do arquivo a "m…". Não perde dado, só informação.

## Critérios de aceite
- [ ] Em 375 px, a mensagem de erro quebra em duas linhas e o caminho mantém ao menos o nome do arquivo.

## Onde
`web/src/layout/StatusBar.tsx`.

## Como verificar
Medir em 375 px com o salvamento falhando.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
