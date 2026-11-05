# T-565: Deixar a amostra da Aparência sempre à vista em `lg`

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: [discovery aparência do manual 2026-11-05 (F1, opção A)](../discovery/2026-11-05-aparencia-do-manual.md)

## Problema
Na modal Aparência (Ajustes), a amostra fica na coluna direita sem sticky (`web/src/features/settings/ManualAppearanceDialog.tsx`, comentário "sem sticky"). Medido a 1280x800: depois de rolar até o fim, a amostra fica em `top = -807 px`, fora da tela. Quem troca fonte ou cor não vê o efeito.

## Critérios de aceite
- [x] Em `lg`, a amostra fica fixa na coluna direita enquanto a esquerda rola.
- [x] A 1280x800, depois de rolar a modal até o fim, a amostra aparece inteira (top >= 0 e bottom <= altura da janela).
- [x] A 1280x600, a amostra continua visível ao rolar (o sticky funciona dentro do contêiner com rolagem).
- [x] Abaixo de `lg` nada muda (a amostra continua depois das seções; fica para outro ticket).

## Onde
`web/src/features/settings/ManualAppearanceDialog.tsx`; `ThemeSample.tsx` só se precisar de ajuste de altura.

## Como verificar
Sem teste de unidade (layout). Asserção de rolagem no e2e da modal (qa). Medir `top` e `bottom` da amostra com script Playwright, a 1280x800 e 1280x600, tema claro.

## Registro
Feito em `feat/ui-aparencia` (d073cd2). `lg:sticky lg:top-0 lg:self-start` na coluna da amostra. E2E mede top/bottom em 1280x800 e 1280x600 (`studio.aparencia.e2e.ts`). Abaixo de lg igual.
