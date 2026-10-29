# T-018: Página vazia que ensina o primeiro passo com print

- Prioridade: P3
- Status: aberto
- Agente: design
- Origem: Crítica de design 2026-10-29 (26/40, .impeccable/critique/)

## Problema
Os estados vazios são neutros ("Sem título", "Nenhuma página ainda"). Não há a voz do professor em lugar nenhum, e o momento-chave da marca (colar o primeiro print) não é ensinado.

## Critérios de aceite
- [ ] Página vazia sugere o caminho: colar um print (Ctrl+V) e numerar o que a pessoa precisa clicar.
- [ ] Texto no tom da marca, sem humor, em pt-BR e en.
- [ ] Desaparece assim que a página tem conteúdo.

## Onde
`features/editor/extensions.ts` (placeholder), `components/EmptyState.tsx`, `lib/i18n.en.ts`.

## Como verificar
Prints; teste de i18n.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
