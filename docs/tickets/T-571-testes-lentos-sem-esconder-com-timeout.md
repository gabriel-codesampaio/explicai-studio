# T-571: Achar e consertar os testes lentos em vez de esconder com timeout

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: qa (+ frontend)
- Origem: pedido da pessoa, 2026-11-05; relacionado a [T-426](T-426-tirar-tolerancia-dos-e2e-que-so-falham-no-ci.md)

## Problema
O Windows do CI estoura o limite de 5 s do Vitest em `test/export-audience.test.ts`, em `test/format-contract.test.ts` e no teste de PDF "todas as imagens entram no PDF" (cerca de 32 s, com `ECONNREFUSED` na porta 3000). `web/test/pageTreeNumbers.test.tsx` (500 páginas) é flaky sob carga. O #143 subiu o `testTimeout` de 5 s para 20 s para destravar o CI, o que esconde a lentidão em vez de resolver.

## Escopo
- Medir: `vitest run --reporter=verbose` (ou `--reporter=default` com durações) e listar os 10 testes mais lentos, no Windows e no Linux/macOS.
- Consertar a causa: fixture menor, mock do que não é o alvo do teste, reaproveitar o Chrome ou o servidor entre testes, sem rede nem porta fixa 3000.
- Devolver o `testTimeout` a um valor justo (por exemplo 10 s).
- Não usar `toPass`, retry nem aumento de timeout por teste para mascarar.

## Critérios de aceite
- [ ] Lista dos 10 mais lentos, com tempo antes e depois, no Registro.
- [ ] `export-audience`, `format-contract`, o teste de PDF e `pageTreeNumbers` abaixo de metade do novo timeout no Windows do CI.
- [ ] Nenhuma porta fixa nem chamada de rede nos testes de unidade (`ECONNREFUSED :3000` some do log).
- [ ] `testTimeout` de volta a um valor justo, sem vermelho em 3 CIs seguidos (Windows, macOS, Linux).

## Onde
`vitest.config.ts`, `test/export-audience.test.ts`, `test/format-contract.test.ts`, teste de PDF, `web/test/pageTreeNumbers.test.tsx`.

## Como verificar
`npx vitest run --maxWorkers=2 --reporter=verbose` antes e depois; 3 execuções seguidas do CI sem falha de tempo.

## Riscos
Fixture menor perder cobertura do caso grande (500 páginas): manter um teste do caso grande, mas rápido (por exemplo medindo a função pura, sem montar a árvore na tela).

## Registro
Parcial (2026-11-05, Windows local, vitest --maxWorkers=2, 905 testes, 0 falhas):
- Top 10 lentos: symlink "recusa o link" 3,1 s; error-page "fontes da marca" 3,1 s; server "recebe imagem" 3,0 s; error-page "index.html" 3,0 s; pageTreeNumbers (500 páginas) 2,9 s; pageTreeMemo (500) 2,3 s; export-pdf-real 2,2 s; export-pdf-images 2,1 s; annotation-style 1,1 s; export PDF "navegador da máquina" 1,1 s.
- export-audience (<0,2 s por teste) e format-contract (<0,1 s) não são lentos localmente; a lentidão do CI Windows não reproduz aqui. O teste de PDF já tem timeout próprio de 120 s e mede 2 s.
- Causa do `ECONNREFUSED :3000`: `web/test/exportAudience.test.tsx` montava o ExportDialog com `useManualCheck` real (fetch). Agora mocka o hook; o log fica limpo.
- `testTimeout` voltou a 10 s; suíte passa.
- Fica: medir no Windows do CI (3 execuções) e reduzir pageTreeNumbers/pageTreeMemo (medir a função pura) se ainda passarem de 5 s lá. Ticket segue aberto.
