# T-263: Rodar axe na busca e no menu "/" depois do T-171

- Prioridade: P3
- Tamanho: P
- Status: concluído
- Agente: qa
- Marco: antes do npm (passada pesada)
- Origem: relatório do supervisor do marco 0.4, 2026-11-04 (achado do T-171)

## Problema
O T-171 tirou o listbox vazio, mas o axe não foi rodado.

## Critérios de aceite
- [x] Axe sem violação na busca (Ctrl+P) e no menu "/", vazio e com resultado.

## Registro
Commit: o que fecha este ticket (`test(T-263)`).

Axe completo (todas as regras), 1280 px claro, Chrome headless: busca Ctrl+P sem consulta, com resultado ("conf") e sem resultado; menu "/" com resultado e sem resultado (o menu fecha). Busca: 0 violações nos três estados. Menu "/": 1 moderada, `region` (`.react-renderer`, a lista flutua no body fora do `<main>`). Correção: o wrapper ganhou `role="region"` e `aria-label="Inserir bloco"` (`slashCommand.ts`). Depois: 0 violações em todos.

Teste: `e2e/studio.menus-axe.e2e.ts` (segundo teste). Com o diálogo da busca aberto o `<main>` fica inert (T-173) e o axe acusa a rolagem dele sem foco; o teste exclui `#conteudo` nesses estados. Rodado: `E2E_PORT=4493 npx playwright test e2e/studio.menus-axe.e2e.ts --workers=2` -> 2 passam. Prints: scratchpad `verif-busca-resultado.png`, `verif-slash-resultado.png`.
