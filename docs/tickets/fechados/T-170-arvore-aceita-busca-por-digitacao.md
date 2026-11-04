# T-170: Deixar a árvore de páginas aceitar busca por digitação

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado A21 (avaliado no commit 60a0e3d)

## Problema
Achado A21. A árvore não aceita busca por digitação. Setas, Home e End funcionam, mas digitar a primeira letra de uma página não a seleciona.

## Critérios de aceite
- [x] Digitar letras com a árvore focada leva à página cujo título começa com elas.
- [x] Setas, Home e End seguem funcionando.
- [x] A digitação não dispara atalhos do editor.

## Onde
- web/src/features/pages/PageTree.tsx

## Como verificar
Focar a árvore, digitar a inicial de uma página: ela é selecionada. Conferir setas, Home e End. Teste de teclado do componente.

## Registro
Commit: este commit.
Feito: useTreeKeyboard ganha busca por digitação (letras seguidas, pausa de 700 ms zera, mesma letra repetida anda entre páginas com a inicial; Ctrl/Alt/Meta ignorados; preventDefault evita atalhos). Botão da página leva data-page-title. Testes de teclado no hook.
Fora: não conferido no navegador.
