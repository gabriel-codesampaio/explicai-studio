# T-183: Rolar até o aviso depois de exportar

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa, 2026-11-04 (lote 1.0)

## Problema
Depois de exportar, o aviso "Site (HTML) exportado · N páginas" com "Abrir o arquivo" aparece no fim do diálogo, fora da área visível.

## Critérios de aceite
- [ ] Ao terminar a exportação, o diálogo rola até o aviso (`scrollIntoView` suave, sem animação com prefers-reduced-motion) e o foco vai para ele ou para "Abrir o arquivo".
- [ ] Aviso anunciado ao leitor de tela (role=status).
- [ ] O mesmo para erro de exportação.

## Onde
- web/src/features/export/ExportDialog.tsx
- Relacionado: T-152 (botão Exportar visível); fazer junto

## Como verificar
E2e de exportação em 1280x720: aviso dentro da área visível ao terminar.

## Registro
Commit `b13e292`, junto do T-152. Aviso com role=status/alert dentro do rodapé, foco e scrollIntoView ao terminar (sucesso e erro).
