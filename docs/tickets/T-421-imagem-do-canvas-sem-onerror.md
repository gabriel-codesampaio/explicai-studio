# T-421: Mostrar erro quando a imagem do canvas de marcação não carrega

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: lote de medição, 2026-11-04

## Problema
O `<img>` em `AnnotationCanvas.tsx:149` não tem `onError`: imagem que não carrega deixa o canvas vazio, sem aviso (achado do T-401).

## Critérios de aceite
- [ ] Falha de carga mostra motivo e "Tentar de novo", com teste.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
