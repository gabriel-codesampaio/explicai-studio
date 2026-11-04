# T-143: Renomear o manual

- Prioridade: P2
- Tamanho: G
- Status: aberto
- Agente: frontend
- Origem: pedido da pessoa (2026-11-04), com print em `explicai/../images` da sessão

## Problema
Hoje não dá para mudar o nome do manual.

## Decisão (sem a pessoa, para conferir)
Muda só o título (`manual.json`). A pasta e o slug ficam como estão, para não quebrar manual, caminho nem link existente. Se o título aparece no export, o export passa a usar o novo.

## Critérios de aceite
- [ ] Renomear pelo seletor do manual no Studio, com validação (vazio, só espaços) e mensagem.
- [ ] Pasta, slug, ids e links de página intactos; manual antigo abre igual.
- [ ] Servidor, núcleo (função + teste), tela pt/en, e2e.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
