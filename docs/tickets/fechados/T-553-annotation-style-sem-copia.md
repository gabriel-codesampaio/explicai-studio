# T-553: annotationStyle do web reexporta o do core

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: supervisor
- Origem: audit ponytail 2026-11-05

## Problema
web/src/lib/annotationStyle.ts é cópia idêntica de src/core/annotationStyle.ts, guardada por teste de igualdade (test/annotation-style.test.ts).

## Critérios de aceite
- [ ] Web reexporta do core; cópia e teste de igualdade removidos, se o build do Vite aceitar.
- [ ] check e build verdes.

## Registro
- Fechado na branch fix/ponytail-core. Web reexporta do core; cópia e teste de igualdade removidos; typecheck e vite build ok.
