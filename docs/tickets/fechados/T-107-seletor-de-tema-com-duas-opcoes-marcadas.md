# T-107: Seletor de tema mostra duas opções marcadas e não bate com o tema aplicado

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: relato da pessoa, 2026-11-03

## Problema
Ao abrir o diálogo "Aparência" (TEMA: Claro / Escuro / Sistema), o Studio estava escuro e as opções **Sistema** e **Claro** apareciam marcadas ao mesmo tempo. Print de referência: (print de referência) (no momento do print, só Claro aparece marcado).

Evidência no código:
- `web/src/features/settings/AppearancePanel.tsx:34` marca cada opção com `aria-pressed={look.mode === id}`, e `:36` desenha a marcação só por `aria-pressed:` (fundo, peso, sombra e anel de 2 px).
- `web/src/features/settings/AppearancePanel.tsx:15` lê o estado inicial com `useState(readAppearance)`, uma vez, ao montar o painel.
- `web/src/lib/theme.ts:22` devolve `"system"` para qualquer valor que não seja `light` ou `dark` (inclusive chave ausente ou JSON quebrado). `theme.ts:30` aplica o tema resolvido a partir de `prefers-color-scheme`, então o rótulo da opção e o tema aplicado podem divergir.
- `web/src/hooks/useRovingFocus.ts` é o padrão de barra de ferramentas com setas. `AppearancePanel.tsx` não o usa, então o foco do teclado não tem o mesmo tratamento das outras barras.

Hipóteses a investigar (não são a solução):
1. O estado inicial vem do `localStorage` (`explicai:aparencia`) e diverge do tema aplicado, que pode vir do `prefers-color-scheme` ou do script do `index.html`.
2. O foco ou o anel de foco na opção Claro é lido como seleção (o foco do teclado usa o mesmo visual de marcado).
3. "Sistema" resolvido para escuro deixa o rótulo errado ou enganoso.

## Critérios de aceite
- [ ] Só uma opção aparece marcada por vez (um único `aria-pressed="true"` no grupo).
- [ ] A opção marcada corresponde à preferência salva; sem preferência salva, a marcada é "Sistema".
- [ ] Com "Sistema", o tema aplicado segue o sistema operacional, e o rótulo deixa isso claro sem contradizer o tema em uso.
- [ ] O foco do teclado é visualmente diferente da seleção (um anel de foco não se confunde com o marcado).
- [ ] Há teste cobrindo o estado inicial em cada preferência salva: claro, escuro, sistema e vazio.

## Onde
- `web/src/features/settings/AppearancePanel.tsx`
- `web/src/lib/theme.ts`
- `web/index.html` (script que aplica o tema antes da primeira pintura, que precisa seguir a mesma leitura)
- `web/src/hooks/useRovingFocus.ts` (se a barra passar a usar o padrão de setas)
- Testes da web (`web/` e a pasta de testes unitários)

## Como verificar
- Teste unitário: renderizar o `AppearancePanel` com `localStorage` em `claro`, `escuro`, `sistema` e vazio; checar quantos botões têm `aria-pressed="true"` e qual.
- Teste com `prefers-color-scheme: dark` e preferência "Sistema": `data-theme` no `<html>` é `dark`, e o botão marcado é "Sistema".
- No navegador (Chrome DevTools MCP): abrir Aparência com o Studio escuro, conferir com `evaluate_script` que só um botão tem `aria-pressed="true"`; navegar com Tab e setas e confirmar que o anel de foco tem estilo distinto do marcado.

## Registro
Causa (medida): o estado já estava certo. `readAppearance` e o script do `index.html` leem igual, e o teste novo prova 1 só `aria-pressed=true` para claro, escuro, sistema, vazio e JSON inválido. A segunda "marcada" era o foco: o Dialog focava o 1º botão (Claro) com o contorno padrão do navegador, ao lado do anel azul do marcado (Sistema). Correção em `AppearancePanel.tsx`: foco inicial na opção marcada; marcado = preenchido; foco = anel com recuo, só no teclado.
Teste: `web/test/appearancePanel.test.tsx` (+ alias `@` no `vitest.config.ts`).
Ficou de fora: conferência visual no navegador (anel de foco vs preenchido), rótulo "Sistema" mostrando o tema resolvido.
