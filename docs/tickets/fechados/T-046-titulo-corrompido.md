# T-046: Título aparece como "In�cio" (U+FFFD gravado)

- Prioridade: P1
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: Relato de agente (testes com curl, 2026-10-30)

## Problema
Um título aparecia como "In�cio". O "í" virou U+FFFD no arquivo, não é glifo faltando.

## Critérios de aceite
- [x] Corpo JSON que não é UTF-8 válido volta 400, sem gravar nada.
- [x] Pedaços cortados no meio de um caractere multibyte continuam certos.

## Registro
Causa medida: `readJson` usava `toString("utf8")`, que troca byte inválido por U+FFFD sem avisar. O cliente (curl no Git Bash do Windows) mandou "Início" em Latin-1 (`í` = 0xED). Hipótese do corpo em pedaços descartada: `readBody` já usa `Buffer.concat` e o teste com corte no meio do `í` passa antes da correção. Único arquivo corrompido achado: `%TEMP%\equipe\t-043-data\auditoria\pages\in-cio.md` (dado de teste do T-043; `title: In\xEF\xBF\xBDcio`, slug `in-cio`). Nenhum manual real nem `exemplos/` afetado. Correção: `TextDecoder` com `fatal` em `src/server/http.ts`.
