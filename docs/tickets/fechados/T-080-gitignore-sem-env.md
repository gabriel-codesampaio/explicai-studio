# T-080: Incluir .env no .gitignore

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: qa
- Origem: revisão de design e de código do lote 6 (2026-11-02)

## Problema
O .gitignore não tem regra para .env nem .env.* (apontado pelo agente de segurança).

## Critérios de aceite
- [ ] `.env` e `.env.*` ignorados, com `!.env.example` se existir.

## Onde
.gitignore

## Como verificar
Teste da área e medida por script no navegador.

## Registro
Feito em 354eb5a: `.env`, `.env.*` ignorados (`!.env.example`).
