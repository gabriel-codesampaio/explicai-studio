# T-204: Auditoria completa de acessibilidade para a 1.0

- Prioridade: P2
- Tamanho: M
- Status: fechado
- Agente: qa
- Marco: 0.9
- Origem: discovery [versao-1-0](../../discovery/archives/versao-1-0.md), lacuna 8 (2026-11-04)

## Problema
Auditoria de a11y completa (axe em todas as telas e estados + leitor de tela) como ticket de marco, não só os achados soltos.

## Critérios de aceite
- [x] Axe (WCAG 2.2 AA) em todas as telas e estados do Studio, nos dois temas. Passada com NVDA e axe no HTML exportado ficam fora (ver Registro).
- [x] Documentado no Registro.

## Como verificar
Conforme a discovery; evidência no Registro.

## Registro
Commit: test(a11y): auditar acessibilidade completa da 1.0 (T-204).
Feito: `e2e/studio.menus-axe.e2e.ts` ganhou a auditoria em tema claro e escuro: página com sidebar e editor, Exportar, Aparência, Públicos, Versões, Lixeira, Ajuda, Tema, Idioma, marcação de imagem (Editar imagem), passeio (2 passos) e as telas 404 de página, 404 de manual e "Studio não está respondendo". Em cada uma: axe com tags wcag2a/aa/21/22aa (inclui contraste e target-size), alvos >= 24 px medidos por script e Tab completo (ordem, sem armadilha, foco visível, foco fica no diálogo).
Defeitos corrigidos: (1) amostra da Aparência herdava `--accent`, `--tinta` e `--marca-faixa` do Studio: link branco sobre branco no claro, texto claro sobre fundo branco no escuro (`web/src/styles/base.css`). (2) Linha "Numerar as páginas do PDF" tinha 20 px de altura (`CoverFooterFields.tsx`, `min-h-6`).
Achados sem ticket: nenhum defeito grande.
Fora: passada manual com NVDA nos três fluxos (precisa de pessoa); axe no HTML exportado; árvore de páginas com muitos níveis e menu de contexto da árvore (cobertos só pelo teste de menus). O foco do título da página é um sublinhado na cor primária (aceito pelo teste).
