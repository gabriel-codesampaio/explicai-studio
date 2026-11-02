# T-076: Título truncado na árvore estreita sem tooltip

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: revisão de design e de código do lote 6 (2026-11-02)

## Problema
Na coluna de 14rem (900 a 1023 px) o título da página trunca ("Configuração av…") e não há como ler o nome inteiro.

## Critérios de aceite
- [ ] O item da árvore tem `title` com o nome completo quando trunca.

## Onde
web/src/features/pages/PageTree.tsx

## Como verificar
Teste da área e medida por script no navegador.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
