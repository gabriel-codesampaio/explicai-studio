# T-401: Mostrar o erro quando a imagem do diálogo de marcação não carrega

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: relatório do lote de código 2, 2026-11-04

## Problema
`AnnotationEditor.tsx:77` engole o erro de carga com `.catch(() => {})`, como o ReducePanel fazia antes do T-325. Se a imagem não carrega, nada avisa.

## Critérios de aceite
- [ ] Erro de carga mostra o motivo e "Tentar de novo", no mesmo padrão do T-325.
- [ ] Teste de unidade do caminho de erro.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
