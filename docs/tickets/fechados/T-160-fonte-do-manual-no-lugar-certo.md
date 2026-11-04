# T-160: Levar a fonte do manual para onde o alcance é claro

- Prioridade: P2
- Tamanho: M
- Status: descartado
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado A10 (avaliado no commit 60a0e3d)

## Problema
Achado A10. A fonte do manual fica entre os controles de formatação de texto, sem avisar que vale para o manual inteiro. O nome da fonte é cortado (ex.: "Atkinson Hyp…"). Relacionado ao T-065 (fechado: fonte pela barra de ferramentas) e ao T-030 (fechado: fontes do manual exportado).

## Critérios de aceite
- [ ] A escolha da fonte do manual fica em Exportar, ou na barra com aviso de alcance ("Vale para o manual inteiro"). A escolha vai no Registro.
- [ ] O nome da fonte aparece inteiro em 1280 e 375 px.
- [ ] A fonte de um texto selecionado continua separada da fonte do manual.

## Onde
- web/src/features/editor/FontMenu.tsx

## Como verificar
Abrir o menu de fonte em 1280 e 375 px e medir o nome com evaluate_script (scrollWidth x clientWidth). Conferir que o aviso aparece quando o menu abre.

## Registro
2026-11-04: absorvido pelo T-188 (fonte do manual sai da barra e vai para a tela Aparência do manual; fonte de trecho no T-182).
