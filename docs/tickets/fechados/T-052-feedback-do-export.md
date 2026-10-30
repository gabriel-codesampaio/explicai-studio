# T-052: Feedback visual ao exportar o manual

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend

## Problema
Ao exportar, a pessoa não via a etapa (o PDF abre um navegador e demora), podia fechar o diálogo no meio, e o resultado e o erro eram texto solto.

## Feito
- Exportando: botão desabilitado com spinner, diálogo sem fechar (Esc, clique fora, X), `aria-busy`, região `role=status`, "Gerando PDF…" no PDF, sem barra falsa, `motion-reduce` no spinner.
- Terminou: formato, páginas, caminho `exportacao/...`, avisos (página que ficou de fora), "Abrir o arquivo" e "Copiar caminho". O servidor não tem rota para abrir pasta; não foi criada (evita superfície nova).
- Falhou: `errorMessage` (códigos da T-042) e botão "Tentar de novo".
- e2e: HTML e Markdown com resposta atrasada, sucesso com caminho, erro 500 simulado e nova tentativa.
