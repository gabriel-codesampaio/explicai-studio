# T-036: Deixar o corretor do navegador explícito no editor e explicar na ajuda

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: [Discovery de ortografia](../../discovery/archives/2026-10-30-ortografia.md) (2026-10-30)

## Problema
O corretor do navegador já funciona, mas ninguém sabe que ele segue o idioma do manual nem como ensinar uma palavra a ele.

## Critérios de aceite
- [x] O campo editável tem `spellcheck` ligado e `lang` igual ao idioma do manual, verificado no DOM.
- [x] Trocar o idioma do manual troca o `lang` sem recarregar.
- [x] A ajuda do Studio explica como adicionar uma palavra ao dicionário do navegador, em pt e en.
- [x] Nenhuma dependência nova.

## Onde
`web/src/features/editor/`, `web/src/features/help/`, `web/src/lib/i18n.en.ts`.

## Como verificar
Teste do atributo no editor; conferir no Chrome e no Edge.

## Registro
Editor com `spellcheck=true` e `lang` do manual (atualiza sem recarregar); ajuda (Atalhos) explica Adicionar ao dicionário, pt/en. Não conferido no Edge, só Chrome headless. O idioma do manual não muda na UI hoje, então a troca ao vivo só existe no código. Commit 9f84f65.
