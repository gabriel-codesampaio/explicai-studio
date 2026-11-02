# T-028: Traduzir os textos que ainda aparecem em português com a interface em inglês

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: Verificação do T-019 (qa, 2026-10-29)

## Problema
Com a interface em inglês ainda aparecem em português: o link "Abrir o arquivo" / "Abrir o PDF" depois de exportar (`ExportDialog.tsx`, sem `t()`), o nome acessível da navegação da árvore ("Páginas do manual") e o botão de fechar do diálogo ("Fechar").

## Critérios de aceite
- [ ] Com a interface em inglês, esses três textos saem em inglês, e o teste de i18n cobre as chaves.

## Onde
`features/export/ExportDialog.tsx`, `features/pages/PageTree.tsx` ou `layout/Navigation.tsx`, `components/ui/dialog.tsx`, `lib/i18n.en.ts`.

## Como verificar
Snapshot de acessibilidade com a interface em inglês; `web/test/i18n.test.ts`.

## Registro
Commit 4b1b5ff. O link "Abrir o arquivo"/"Abrir o PDF" já passava por `t()` (em `ExportStatus.tsx`) e tinha chave em inglês. Faltavam o "Fechar" do diálogo (`dialog.tsx`) e o `aria-label` da nav em `Sidebar.tsx`; agora usam `t()`, com a chave nova `Fechar` em `i18n.en.ts` ("Páginas do manual" já existia). `i18n.test.ts` varre todo `t("...")` e falha se faltar a chave, então cobre os três. Seletores do e2e ficam iguais (rodam em português). check verde, 365 testes. Fica de fora: snapshot de acessibilidade no navegador em inglês.
