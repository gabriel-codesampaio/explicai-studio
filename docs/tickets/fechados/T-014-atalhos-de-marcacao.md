# T-014: Atalhos de letra nas ferramentas de marcação

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
As cinco ferramentas do diálogo de marcação só funcionam no clique, e os itens da lista se chamam "Destaque 1", "Seta 1".

## Critérios de aceite
- [x] Atalhos V (selecionar), M (marcador), D (destaque), S (seta) e A (área clicável), mostrados ao lado de cada ferramenta e na lista de Atalhos.
- [x] Os atalhos não disparam enquanto se digita num campo.
- [x] Barra de ferramentas mais compacta (ícone + letra), com nome acessível.

## Onde
`features/annotations/AnnotationEditor.tsx`, `features/help/ShortcutsDialog.tsx`, `lib/i18n.en.ts`.

## Como verificar
Teste de ponta a ponta trocando de ferramenta pelo teclado.

## Registro
Commits: c8edbfa, 955d683.

O que foi feito: `toolForKey` (`web/src/lib/toolShortcuts.ts`) é função pura: V/M/D/S/A viram select/marker/highlight/arrow/hotspot, sem diferenciar maiúscula, e devolve nada com Ctrl/Alt/Meta ou dentro de input, textarea, select e contenteditable (`web/test/toolShortcuts.test.ts`). O diálogo de marcação usa a função no `onKeyDown`. Cada botão mostra ícone + letra, com `aria-label` (nome), `title` e `aria-keyshortcuts`. A lista de Atalhos ganhou as cinco letras em "Marcando imagens", com tradução em inglês. e2e: `studio.imagem.e2e.ts` troca de ferramenta pelo teclado e confere que digitar "vsa" na descrição não troca. Formato de dados e export não mudaram.

Ficou de fora: não medi o layout em 375 e 1280 com script; a barra só ficou menor (sem o texto do nome) e continua com `flex-wrap`. Os itens da lista seguem como "Destaque 1", "Seta 1".
