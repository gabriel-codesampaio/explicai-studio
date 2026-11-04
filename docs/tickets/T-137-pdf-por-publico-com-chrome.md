# T-137: PDF por público com Chrome de verdade

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: qa
- Origem: sobra do T-124 (2026-11-04)

## Problema
O teste do PDF por público usa navegador falso, então nada prova que o arquivo real sai só com as páginas do perfil.

## Critérios de aceite
- [ ] Teste ou conferência gera o PDF com Chrome real para dois perfis.
- [ ] O PDF de um perfil não contém texto de página exclusiva do outro.

## Onde
`src/core/export/`.

## Como verificar
Extrair o texto dos dois PDFs e comparar.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
