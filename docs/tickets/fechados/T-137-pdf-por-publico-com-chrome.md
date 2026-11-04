# T-137: PDF por público com Chrome de verdade

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: qa
- Origem: sobra do T-124 (2026-11-04)

## Problema
O teste do PDF por público usa navegador falso, então nada prova que o arquivo real sai só com as páginas do perfil.

## Critérios de aceite
- [x] Teste ou conferência gera o PDF com Chrome real para dois perfis.
- [x] O PDF de um perfil não contém texto de página exclusiva do outro.

## Onde
`src/core/export/`.

## Como verificar
Extrair o texto dos dois PDFs e comparar.

## Registro
Teste novo com o Chrome de verdade (`test/export-pdf-real.test.ts`, pula se não houver navegador): PDFs de dois perfis, o do cliente com <= 3 páginas e o do admin com >= 4 a mais por causa da página longa só dele. Limite: prova por contagem de páginas, não por extração de texto (sem biblioteca de PDF no projeto e sem dependência nova); o supervisor conferiu os títulos por fora.
