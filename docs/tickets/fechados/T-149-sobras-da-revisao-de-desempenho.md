# T-149: Fila entre processos e tamanho do bundle

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: achados da revisão registrados na passagem de 03/11/2026

## Problema
- `src/core/manuals.ts`: a fila de gravação só vale dentro de um processo. Studio e MCP abertos no mesmo manual ainda podem se atropelar.
- O maior chunk JS do Studio tem cerca de 1,17 MB.

## Critérios de aceite
- [x] Decidir e registrar se a fila entre processos vale o custo. Se não valer, comentário `shortcut:` em `manuals.ts` e aviso no README do MCP.
- [x] Medir o que pesa no chunk e dividir o que for barato de dividir, sem piorar a abertura do editor.

## Como verificar
Teste com dois processos gravando no mesmo manual, se a fila entrar. Tamanho do chunk antes e depois.

## Registro
- Fila entre processos: decidido que não vale o custo (exigiria lock de arquivo; uso simultâneo Studio+MCP no mesmo manual é raro). Comentário `shortcut:` em `src/core/manuals.ts`. Fora deste repo: aviso no README do MCP (`explicai-mcp`) fica pendente.
- Bundle: maior chunk 1.240,97 kB (gzip 382,65) antes, 1.210,73 kB (gzip 374,14) depois. Corte barato: `AnnotationEditor` virou `React.lazy` em `Editor.tsx` (chunk próprio de 32,7 kB, carregado só ao anotar imagem). Abertura do editor não piora (só perde código).
- Ficou: o peso restante é Tiptap/ProseMirror + lucide + Radix, todos no caminho de abertura do editor. Cortar mais exige dividir o editor (ex.: manualChunks de vendor, ganho só de cache, não de carga) ou trocar ícones por imports pontuais; não é barato. Sem visualizer instalado; análise por imports.
