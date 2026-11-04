# T-143: Renomear o manual

- Prioridade: P2
- Tamanho: G
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa (2026-11-04), com print em `explicai/../images` da sessão

## Problema
Hoje não dá para mudar o nome do manual.

## Decisão (sem a pessoa, para conferir)
Muda só o título (`manual.json`). A pasta e o slug ficam como estão, para não quebrar manual, caminho nem link existente. Se o título aparece no export, o export passa a usar o novo.

## Critérios de aceite
- [x] Renomear pelo seletor do manual no Studio, com validação (vazio, só espaços) e mensagem.
- [x] Pasta, slug, ids e links de página intactos; manual antigo abre igual.
- [x] Servidor, núcleo (função + teste), tela pt/en, e2e.

## Registro
Renomear muda só o título em manual.json (`renameManual`, pela fila de escrita; theme, audiences e logo ficam). Pasta, slug, ids e hash da URL não mudam: conferido no e2e. Rota PUT /api/manuals/:slug (400 título vazio, 404 inexistente). Studio: item Renomear manual no seletor, diálogo com Enter/Esc, erro em role=alert, foco volta ao seletor; sidebar, breadcrumb e export atualizam sem recarregar. Fora: limite de tamanho do título (createManual também não tem); sem print nem contraste medido.
