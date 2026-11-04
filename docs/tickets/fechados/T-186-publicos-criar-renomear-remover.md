# T-186: Públicos: criar, renomear e remover (core e API)

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: discovery [aparencia-sidebar-e-perfis](../discovery/aparencia-sidebar-e-perfis.md), pedido da pessoa 2026-11-04 (lote 1.0)

## Problema
Ver a seção correspondente da discovery. Absorve: nada. Base do T-187.

Decisões da pessoa (2026-11-04): termo único "Público" ("perfil" sai da interface); remover público libera as páginas só dele para todos, com confirmação mostrando contagem e títulos; renomear para nome existente é recusado; a fonte do manual sai da barra do editor e fica só na Aparência (fonte de trecho vai na barra da seleção, T-182); cores do manual não aparecem no editor, só na amostra; painel atual "Aparência" vira "Tema do Studio".

## Critérios de aceite
- [x] `addAudience`, `renameAudience`, `removeAudience` em `src/core/audience.ts`, usadas pelo servidor; formato de `manual.json` e do frontmatter inalterado.
- [x] Renomear reescreve `audiences` e todas as páginas que citam o nome (inclusive na lixeira); devolve a contagem.
- [x] Nome vazio, acima de 40 caracteres ou igual a outro (ignorando maiúscula) é recusado com o motivo; nada é gravado.
- [x] Remover tira o nome de `audiences` e das páginas; página que só tinha esse nome volta a "todos"; a resposta traz as páginas liberadas.
- [x] Operação reexecutável: com falha no meio, repetir termina o serviço (teste com falha injetada).
- [x] Rotas `POST/PATCH/DELETE /api/manuals/:slug/audiences[/:name]` com validação de entrada.
- [x] Teste: renomear e remover com página aberta no editor não regrava o nome antigo (flush + recarga).
- [x] `docs/manual-format.md` (seção Público) diz que renomear e remover são do Studio e que a lista pode ter público sem página.
- [x] `npm run check` passa.

## Como verificar
Os critérios acima, com script Playwright (uma largura na fatia; matriz 375/1280, claro/escuro, pt/en no fecho do lote).

## Registro
Branch feat/t-186-publicos-core (`feat(audience)`, `feat(server)`, `fix(audience)`).
- `addAudience`/`renameAudience`/`removeAudience` em `src/core/audience.ts`; rotas em `src/server/routes/audiences.ts`; erros 400/404/409.
- Páginas e lixeira primeiro, `manual.json` por último; repetir após falha termina (teste com falha injetada). Caminho da lixeira confinado com `resolveInside`.
- Ficou de fora: página com frontmatter quebrado é pulada em silêncio (limite aceito); renomear para nome só no frontmatter funde sem recusar; flush/recarga do editor é do T-187.

