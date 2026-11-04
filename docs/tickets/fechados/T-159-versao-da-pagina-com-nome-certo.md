# T-159: Deixar claro que "Versão" vale para a página, não para o manual

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado A9 (avaliado no commit 60a0e3d)

## Problema
Achado A9. "Versão do manual" parece valer para o manual inteiro, mas vale para uma página. Guardar, Restaurar e Usar no manual exigem entender o modelo para escolher. Relacionado ao T-016 (fechado: um nome só para a versão do manual final), que trata de outro conceito.

## Critérios de aceite
- [ ] O título do painel diz que a versão é da página.
- [ ] Guardar, Restaurar e Usar no manual dizem o alcance no próprio texto.
- [ ] Textos novos com chave de i18n em pt e en.
- [ ] Remover versão (T-144) e renomear manual (T-143) seguem funcionando.

## Onde
- web/src/features/versions/VersionsPanel.tsx

## Como verificar
Abrir o painel em pt e en e ler os três botões sem contexto. Teste de componente do painel.

## Registro
Feito: descrição, botões Guardar, Restaurar e Usar no manual dizem que valem para a página (pt e en). Botão Versões mantém o nome curto. e2e de versões e renomear passam.
