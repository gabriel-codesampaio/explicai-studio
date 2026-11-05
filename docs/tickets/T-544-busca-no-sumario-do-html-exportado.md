# T-544: Campo de busca no sumário do HTML exportado

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: core (+ qa)
- Origem: [relatório de features 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), feature 5 (esforço M, risco M)

## Problema
O cliente recebe o HTML de 80 páginas e só tem o sumário para achar algo. O leitor final é metade do produto ("um manual, dois leitores"). GitBook tem busca, mas é site hospedado; busca offline e sem servidor é diferença do Studio.

## Escopo
- Campo no topo do sumário que filtra os itens e destaca as seções cujo texto contém o termo.
- JavaScript pequeno inline, sem dependência. Sem relevância nem fuzzy.
- PDF não muda.

## Critérios de aceite
- [ ] O campo filtra itens e destaca seções com o termo, sem acento nem caixa.
- [ ] Respeita o filtro de público: só páginas do público aparecem.
- [ ] Sem dependência nova; o script cabe na CSP do export (T-082) e não usa `eval`.
- [ ] Sem JavaScript, o HTML segue legível (sumário e seções).
- [ ] Campo com rótulo, foco visível e anúncio de quantos resultados.
- [ ] Teste de exportação: o HTML tem o script, a CSP aceita, e o termo digitado não entra em `innerHTML` (sem XSS).

## Onde
`src/core/export/html.ts`, CSS do export, testes de exportação (T-058). Dependências: T-082 (CSP), T-132 (leitura do export HTML). A função de normalização de acento pode ser a mesma da busca do Studio (T-543).

## Como verificar
Abrir o HTML exportado do `docs/exemplo` no navegador: buscar com e sem acento, com e sem JavaScript; axe.

## Riscos
Regras de segurança do export (CSP e XSS). Por isso o teste de XSS é critério.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
