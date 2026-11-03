# T-078: Grupo Versões / Rascunho / Exportar deslocado em 375 px

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: design
- Origem: revisão de design e de código do lote 6 (2026-11-02)

## Problema
Em 375 px o grupo Versões, Rascunho e Exportar manual fica deslocado para a direita, abaixo do breadcrumb.

## Critérios de aceite
- [x] Em 375 px o grupo alinha à esquerda ou quebra sem deslocamento, sem rolagem horizontal.

## Onde
web/src/layout (cabeçalho da página)

## Como verificar
Teste da área e medida por script no navegador.

## Registro
Branch `fix/t-078-grupo-exportar-375`. PageView: grupo sem ml-auto/justify-end abaixo de sm (desce alinhado à esquerda sob o caminho); a partir de sm segue à direita. Medido em 375: sem rolagem horizontal, grupo à esquerda; 1280: grupo à direita como antes. Sem teste automático (CSS).
