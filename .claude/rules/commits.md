# Commits

Todo commit segue o [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

```
tipo(escopo): descrição no imperativo, em português, sem ponto final

Corpo: por que a mudança foi feita e o que muda para quem usa.
Fecha T-0NN (quando for trabalho de um ticket)
```

- Tipos: `feat` (recurso novo), `fix` (correção), `docs`, `test`, `refactor`, `style` (formatação), `perf`, `build`, `ci`, `chore`.
- Escopos deste projeto: `core`, `export`, `server`, `editor`, `annotations`, `pages`, `versions`, `i18n`, `ui`, `tickets`, `deps`. Pode faltar quando a mudança é transversal.
- Mudança incompatível (formato do manual, API) leva `!` depois do tipo e `BREAKING CHANGE:` no corpo.
- Um assunto por commit, e cada commit passa no `npm run check` sozinho.

Exemplos:

```
feat(export): embute as fontes da marca no HTML exportado
fix(editor): mantém a seleção do link quando o Ctrl+K vem logo depois do Shift+Home
docs(tickets): abre T-021 a T-024 (revisão de acessibilidade)
```
