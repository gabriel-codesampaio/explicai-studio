# T-149: Fila entre processos e tamanho do bundle

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: achados da revisão registrados na passagem de 03/11/2026

## Problema
- `src/core/manuals.ts`: a fila de gravação só vale dentro de um processo. Studio e MCP abertos no mesmo manual ainda podem se atropelar.
- O maior chunk JS do Studio tem cerca de 1,17 MB.

## Critérios de aceite
- [ ] Decidir e registrar se a fila entre processos vale o custo. Se não valer, comentário `shortcut:` em `manuals.ts` e aviso no README do MCP.
- [ ] Medir o que pesa no chunk e dividir o que for barato de dividir, sem piorar a abertura do editor.

## Como verificar
Teste com dois processos gravando no mesmo manual, se a fila entrar. Tamanho do chunk antes e depois.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
