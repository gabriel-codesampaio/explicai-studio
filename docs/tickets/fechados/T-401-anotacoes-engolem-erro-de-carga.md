# T-401: Mostrar o erro quando a imagem do diálogo de marcação não carrega

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: relatório do lote de código 2, 2026-11-04

## Problema
`AnnotationEditor.tsx:77` engole o erro de carga com `.catch(() => {})`, como o ReducePanel fazia antes do T-325. Se a imagem não carrega, nada avisa.

## Critérios de aceite
- [x] Erro de carga mostra o motivo e "Tentar de novo", no mesmo padrão do T-325.
- [x] Teste de unidade do caminho de erro.

## Registro
- Linha 77 era a consulta `api.inGitRepo`, não a carga da imagem. Falha dela agora mostra alerta com motivo e "Tentar de novo" (`AnnotationEditor.tsx`, teste `web/test/annotationEditor.test.tsx`, strings pt/en). Carga do `<img>` em `AnnotationCanvas.tsx:149` sem `onError`: T-421.
