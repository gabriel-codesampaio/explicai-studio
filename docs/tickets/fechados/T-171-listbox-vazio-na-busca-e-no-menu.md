# T-171: Tirar o listbox vazio da busca e do menu "/"

- Prioridade: P1
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado B1 (avaliado no commit 60a0e3d)

## Problema
Achado B1, axe crítico, critério 4.1.2. Há listbox vazio, sem opções, na busca e no menu "/" quando não há resultado.

## Critérios de aceite
- [ ] Sem resultado, o listbox não é renderizado; aparece um texto comum "Nenhum resultado".
- [ ] Axe sem violação crítica de 4.1.2 nas duas telas.

## Onde
- web/src/features/pages/PageSearch.tsx
- web/src/features/editor/slash/SlashMenu.tsx

## Como verificar
Buscar um termo sem resultado e digitar um filtro sem resultado no menu "/". Conferir que não há listbox vazio e rodar axe nas duas telas.

## Registro
Feito: sem resultado, `PageSearch` e `SlashMenu` mostram texto comum, sem listbox. Teste em `web/test/emptyListbox.test.tsx`. Axe nas duas telas não rodado.
