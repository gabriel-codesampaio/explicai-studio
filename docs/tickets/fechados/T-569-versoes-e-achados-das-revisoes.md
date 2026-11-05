# T-569: Diálogo Versões a 1280 e achados das revisões (#131, #133, #134)

- Prioridade: P3
- Tamanho: M
- Status: feito
- Agente: frontend

## Problema
(a) No diálogo Versões a 1280, "Fixar no manual" e "⋯" quebravam para uma 2ª linha, desalinhados dos outros botões. (b) PageSearch (#131): `index` passava do fim quando os trechos de texto mudavam (Enter sem efeito, `aria-activedescendant` some) e o grupo "Por título" aparecia vazio só com trechos de texto. (c) NewPageMenu (#134): o Radix podia devolver o foco ao gatilho e roubar o do título da página criada. (d) Versões (#133): "Comparar com o atual" lia o texto salvo, não o do editor.

## Critérios de aceite
- [x] Ações da versão num grupo só: se faltar largura descem juntas, na mesma linha (medido a 1280: todos com o mesmo `top`).
- [x] PageSearch: índice ativo limitado ao fim da lista; grupo "Por título" só com títulos encontrados.
- [x] Fechar o menu de modelos não move o foco; o título da página criada o mantém.
- [x] Comparar grava o autosave pendente (`flush`) antes de ler o texto atual.

## Onde
`web/src/features/versions/VersionsPanel.tsx`, `web/src/layout/PageView.tsx`, `web/src/features/pages/PageSearch.tsx`, `web/src/features/pages/NewPageMenu.tsx`.

## Registro
Testes: `web/test/pageSearch.test.tsx`, `web/test/versionsPanel.test.tsx`, `e2e/studio.modelos.e2e.ts`.
