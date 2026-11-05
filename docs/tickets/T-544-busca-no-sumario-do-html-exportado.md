# T-544: Campo de busca no sumário do HTML exportado

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: core (+ qa)
- Origem: [relatório de features 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), feature 5 (esforço M, risco M)

## Problema
O cliente recebe o HTML de 80 páginas e só tem o sumário para achar algo. O leitor final é metade do produto ("um manual, dois leitores"). GitBook tem busca, mas é site hospedado; busca offline e sem servidor é diferença do Studio.

## Escopo
- Campo no topo do sumário que filtra os itens e destaca as seções cujo texto contém o termo.
- JavaScript pequeno inline, sem dependência. Sem relevância nem fuzzy.
- PDF não muda.

## Critérios de aceite
- [x] O campo filtra itens e destaca seções com o termo, sem acento nem caixa.
- [x] Respeita o filtro de público: só páginas do público aparecem.
- [x] Sem dependência nova; o script cabe na CSP do export (T-082) e não usa `eval`.
- [x] Sem JavaScript, o HTML segue legível (sumário e seções).
- [x] Campo com rótulo, foco visível e anúncio de quantos resultados.
- [x] Teste de exportação: o HTML tem o script, a CSP aceita, e o termo digitado não entra em `innerHTML` (sem XSS).

## Onde
`src/core/export/html.ts`, CSS do export, testes de exportação (T-058). Dependências: T-082 (CSP), T-132 (leitura do export HTML). A função de normalização de acento pode ser a mesma da busca do Studio (T-543).

## Como verificar
Abrir o HTML exportado do `docs/exemplo` no navegador: buscar com e sem acento, com e sem JavaScript; axe.

## Riscos
Regras de segurança do export (CSP e XSS). Por isso o teste de XSS é critério.

## Registro
Feito em `feat/busca-no-sumario-html`. Novo `src/core/export/tocSearch.ts`: campo (`hidden` no HTML, o script o mostra), CSS e script inline de ~1,3 KB, sem `eval` nem `innerHTML` (termo só em `value`/`textContent`/`hidden`/`classList`). Normalização NFD sem acento e sem caixa, igual ao `slugify`. Busca no título e corpo de cada página (sem a navegação entre páginas); filtra o sumário, marca a seção com `.hit` e anuncia a contagem em `role=status` (pt/en por `labelsFor`). PDF: o `.toc` inteiro já some na impressão. Teste: `test/export-toc-search.test.ts` (happy-dom roda o script do HTML exportado); testes que proibiam qualquer `<script` agora aceitam só o da busca. CSP: o export HTML não tem CSP (T-082 é do servidor local, SVG em /files/); nada a ajustar, e o script é fixo e igual em todo export. Fora: relevância, fuzzy, busca por heading dentro de página, `<meta>` CSP no export.
