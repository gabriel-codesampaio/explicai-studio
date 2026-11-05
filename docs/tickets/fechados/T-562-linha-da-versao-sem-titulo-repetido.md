# T-562: Linha da versão não repete o título da página

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: design do lote 1 (PR #127/#128), achado fora do escopo

## Problema
No diálogo Versões cada linha repete o título da página no subtítulo; a versão é desta página, é ruído.

## Critérios de aceite
- [x] Subtítulo só aparece quando o título da versão difere do atual.
- [x] Textos em pt e en; sem regressão nos testes da área.

## Registro
Feito em `feat/ui-aparencia` (fc4f25a). `VersionsPanel` recebe `pageTitle`; a linha só mostra o título da versão quando difere. Teste em `versionsPanel.test.tsx`.
