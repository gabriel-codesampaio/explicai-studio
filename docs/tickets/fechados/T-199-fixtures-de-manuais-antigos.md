# T-199: Fixtures de manual 0.1, 0.2 e 0.3 com teste de abrir, editar, salvar e exportar

- Prioridade: P1
- Tamanho: M
- Status: fechado
- Agente: qa
- Marco: 0.4
- Origem: discovery [versao-1-0](../../discovery/archives/versao-1-0.md), lacuna 2 (2026-11-04)

## Problema
Fixtures congeladas de manual 0.1, 0.2 e 0.3 + teste "abre, edita, salva, exporta" em cada uma.

## Critérios de aceite
- [ ] O que a lacuna 2 descreve, feito e verificado conforme a discovery (seções "O que 1.0 promete" e "Critérios de pronto").
- [ ] Documentado onde a discovery indica.

## Como verificar
Conforme a discovery; evidência no Registro.

## Registro
- Commit: test/t-199-fixtures-antigos (test(compat), chore(lint), docs(tests), docs(tickets)).
- Feito: `test/fixtures/manuais-antigos/{0.1,0.2,0.3}` reconstruídas pelo `manual-format.md` de cada tag; `test/old-manuals.test.ts` (abre, edita, salva, exporta HTML e Markdown; confere versão publicada, manual.json e anotações intactos; 0.3 exporta por público). Passou de primeira: nenhuma perda de dado achada. Biome ignora a pasta. README na pasta documenta a regra de congelar.
- Fora: rodar nas três plataformas (depende do CI); fixture 0.1 mínima reconstruída do doc, não de manual real de usuário.
