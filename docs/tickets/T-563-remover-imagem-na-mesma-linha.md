# T-563: "Remover imagem" não quebra linha no balão

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: design do lote 1 (PR #127/#128), achado fora do escopo

## Problema
No balão da imagem, "Remover imagem" cai numa 2ª linha sob "Editar imagem"; rodapé desigual.

## Critérios de aceite
- [x] Os dois botões cabem sem quebra (balão mais largo ou Remover só com ícone e nome acessível).
- [x] Textos em pt e en; sem regressão nos testes da área.

## Registro
Feito em `feat/ui-aparencia` (3d7421c). Tecla Del saiu do botão para `title`/`aria-keyshortcuts`; os dois botões cabem em uma linha (design confere).
