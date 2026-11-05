# T-559: Painel de estilo do marcador, seletor de bloco e aviso ao fechar sem salvar

- Prioridade: P3
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: [critique 2026-11-05 (27/40)](../../.impeccable/critique/2026-11-05T12-50-20Z__web-src-app-tsx.md)

## Problema
Painel de estilo: "Grande" e "Grossa" caem sozinhos na 2ª linha (grades de 3 e 4 colunas). Seletor de bloco "Texto" tem ~200px com a seta longe. "Herdando da imagem" é jargão. O editor de imagem pede "Salvar marcações" enquanto o resto é autosave.

## Critérios de aceite
- [ ] Painel de estilo sem item órfão na 2ª linha.
- [ ] Seletor de bloco compacto, seta junto do texto.
- [ ] "Herdando da imagem" -> texto claro.
- [ ] Fechar o editor de imagem com mudança não salva avisa (confirmar se já avisa; se não, implementar). Autosave fica fora.
- [ ] Textos em pt e en (`i18n.en.ts`); design confere contra a marca.

## Como verificar
Teste de unidade do que for lógica; conferir a tela com script Playwright (uma largura, um tema) e medir com `evaluate_script`/script.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
