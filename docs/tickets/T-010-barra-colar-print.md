# T-010: "Colar print" com Ctrl+V na barra de ferramentas

- Prioridade: P1
- Status: aberto
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
O slogan é "Tira o print", mas a ação é um botão genérico "Imagem", o único com rótulo e contorno na barra. O Ctrl+V para colar print não aparece em lugar nenhum.

## Critérios de aceite
- [ ] O botão vira "Colar print", com o atalho Ctrl+V visível em mono, e continua abrindo o seletor de arquivo no clique.
- [ ] Seletor de tipo de bloco sem borda, com o nome do bloco em Archivo.
- [ ] A dica "Digite / para inserir blocos" sai da barra e aparece só como placeholder de linha vazia.
- [ ] Textos traduzidos (pt-BR e en).

## Onde
`features/editor/Toolbar.tsx`, `features/editor/BlockTypeMenu.tsx`, `features/editor/extensions.ts` (placeholder), `lib/i18n.en.ts`.

## Como verificar
Teste de ponta a ponta de envio de imagem; teste de i18n; prints.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
