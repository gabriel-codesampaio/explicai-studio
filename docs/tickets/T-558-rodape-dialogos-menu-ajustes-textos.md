# T-558: Padronizar rodapé dos diálogos, menu Ajustes e textos de botão

- Prioridade: P3
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: [critique 2026-11-05 (27/40)](../../.impeccable/critique/2026-11-05T12-50-20Z__web-src-app-tsx.md)

## Problema
Exportar: primário à esquerda e sem Cancelar; editor de imagem: Cancelar/Salvar à direita. Botão "Exportar" não diz o formato. Viúva "atual." na descrição do Exportar. Menu Ajustes mistura manual, app e ajuda; "Tema do Studio" quebra linha.

## Critérios de aceite
- [ ] Rodapé dos diálogos padronizado (primário e Cancelar no mesmo lugar em Exportar e editor de imagem).
- [ ] Botão diz o formato ("Exportar HTML").
- [ ] Sem viúva na descrição do Exportar.
- [ ] Menu Ajustes em grupos: manual (Públicos, Aparência) / app (Tema, Idioma) / ajuda (Passeio); "Tema do Studio" sem quebra.
- [ ] Textos em pt e en (`i18n.en.ts`); design confere contra a marca.

## Como verificar
Teste de unidade do que for lógica; conferir a tela com script Playwright (uma largura, um tema) e medir com `evaluate_script`/script.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
