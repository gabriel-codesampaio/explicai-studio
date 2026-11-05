# T-529: Aviso de versão fixada com texto claro e respiro

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado M4 (Médio)

## Problema
Na página com "Versão do manual", o aviso "O manual final usa a Versão do manual desta página…" repete o termo do rótulo, fica colado à barra de ações e empurra o título para baixo (`m-1280-dark-pagina-imagem.png`). Arquivos: `web/src/features/versions/PinnedNotice.tsx`, `VersionsPanel.tsx:99`. Relacionado: T-016 e T-159 (nomes de versão), fechados.

## Critérios de aceite
- [ ] O aviso não repete o termo do rótulo. Texto sugerido: "Esta página está fixada em uma versão guardada. O que você escrever só entra no manual se voltar ao texto atual." (pt, com a versão en em paridade, T-206).
- [ ] Há 12 px de respiro entre o aviso e a barra de ações.
- [ ] O rótulo segue o termo da documentação de termos; não há dois nomes para a mesma coisa.

## Onde
`PinnedNotice.tsx`, `VersionsPanel.tsx:99`, textos pt/en. Esforço do relatório: P.

## Como verificar
Conferir o texto em pt e en; medir o espaço com `evaluate_script`; o título não desce com o aviso aberto.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
