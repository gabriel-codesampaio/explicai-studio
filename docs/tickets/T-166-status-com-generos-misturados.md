# T-166: Padronizar o gênero e o vocabulário dos status

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado A17 (avaliado no commit 60a0e3d)

## Problema
Achado A17. Os status misturam gêneros: Aprovado e Publicado têm dicas como "Conferida". A exportação fala em páginas aprovadas, mas o status usa outro termo. Relacionado ao T-015 (fechado: "Só páginas aprovadas") e ao T-142 (fechado: status na árvore).

## Critérios de aceite
- [ ] Todas as dicas do menu de status concordam em gênero e usam o mesmo vocabulário.
- [ ] A exportação usa o mesmo termo do menu de status.
- [ ] Textos novos com chave de i18n em pt e en.

## Onde
- web/src/features/pages/StatusMenu.tsx

## Como verificar
Abrir o menu de status e ler todas as dicas. Conferir o texto do diálogo de exportação com "só aprovadas" marcado. Grep pelos termos antigos.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
