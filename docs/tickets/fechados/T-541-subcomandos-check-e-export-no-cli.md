# T-541: Subcomandos check e export no CLI, sem abrir o servidor

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: core (+ qa)
- Origem: [relatório de features 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), feature 2 (esforço M, risco M)

## Problema
Equipe quer o manual no CI: falhar o build se há link morto, gerar PDF no release. Hoje o comando `explicai` só abre o Studio (`--port`, `--no-open`, `--help`). Ele já usa o `explicai/core`, que tem `exportManual` e `checkManual`, então falta só a porta de linha de comando.

**Risco de semver:** flags e nomes de subcomando entram na promessa da 1.x (README, Compatibilidade). Nome errado custa até a 2.0. Por isso o desenho dos nomes é revisado antes de codar.

## Escopo
- `explicai check <pasta> [--manual id] [--fail-on aviso|erro]`
- `explicai export <pasta> --format html|pdf|md [--audience x]`
- Saída de texto; código de saída 1 se houver achado no nível pedido.
- Sem `--json` nesta versão (decidir depois, porque `--json` é outra promessa).

## Critérios de aceite
- [ ] `explicai check` e `explicai export` funcionam sem abrir o servidor, com os flags do escopo.
- [ ] Código de saída 1 com achado no nível pedido; 0 sem achado.
- [ ] Nomes de flag e de subcomando revisados antes de codar, e anotados no README (Compatibilidade) como promessa da 1.x.
- [ ] `--help` atualizado; testes do parser e do código de saída.
- [ ] PDF sem Chrome na máquina ou na imagem de CI dá mensagem clara, que diz o que instalar.

## Onde
Entrada do comando `explicai` (ver `bin` no `package.json`), `src/core/index.ts`, README.

## Como verificar
No terminal, com a pasta de exemplo: cada comando e `echo $?` com e sem achado.

## Riscos
Semver da 1.x (acima). PDF no CI precisa de Chrome na imagem; a mensagem de erro atual já avisa (hipótese, confirmar).

## Decisão
Decidido em 2026-11-05: sim, entra na 1.x só com `explicai check <pasta>` e `explicai export <pasta> --format html|pdf|md`, sem outras opções por enquanto.

## Registro
- 2026-11-05: Decidido em 2026-11-05: sim, entra na 1.x só com `explicai check <pasta>` e `explicai export <pasta> --format html|pdf|md`, sem outras opções por enquanto.
- 2026-11-05: feito em feat/cli-check-export. `explicai check <pasta>` e `explicai export <pasta> --format html|pdf|md` (src/cli-commands.ts), saída 1 com achado ou erro, 0 sem. README anota como promessa 1.x. Ficou de fora: `--manual`, `--fail-on`, `--audience`, `--json` (decisão do ticket).
