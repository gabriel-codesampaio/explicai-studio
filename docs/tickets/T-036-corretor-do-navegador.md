# T-036: Deixar o corretor do navegador explícito no editor e explicar na ajuda

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: [Discovery de ortografia](../discovery/2026-10-30-ortografia.md) (2026-10-30)

## Problema
O corretor do navegador já funciona, mas ninguém sabe que ele segue o idioma do manual nem como ensinar uma palavra a ele.

## Critérios de aceite
- [ ] O campo editável tem `spellcheck` ligado e `lang` igual ao idioma do manual, verificado no DOM.
- [ ] Trocar o idioma do manual troca o `lang` sem recarregar.
- [ ] A ajuda do Studio explica como adicionar uma palavra ao dicionário do navegador, em pt e en.
- [ ] Nenhuma dependência nova.

## Onde
`web/src/features/editor/`, `web/src/features/help/`, `web/src/lib/i18n.en.ts`.

## Como verificar
Teste do atributo no editor; conferir no Chrome e no Edge.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
