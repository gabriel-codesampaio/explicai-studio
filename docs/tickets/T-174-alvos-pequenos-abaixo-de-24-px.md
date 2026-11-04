# T-174: Levar alvos de toque abaixo de 24 px a 24 px

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: relatório UX 2026-11-04, achado B4 (avaliado no commit 60a0e3d)

## Problema
Achado B4, axe sério, critério 2.5.8. Medidas: Opções da coluna 28x20; Tipo de alerta 85x21; Desfazer do aviso 60x23. O X dos diálogos mede 16x16, mas o axe não aponta esse caso.

## Critérios de aceite
- [ ] Opções da coluna, Tipo de alerta e Desfazer do aviso com pelo menos 24x24 px.
- [ ] O X dos diálogos com pelo menos 24x24 px.
- [ ] Axe sem violação de 2.5.8 nessas telas.

## Onde
- web/src/features/editor/TableControls.tsx
- web/src/components/ui/dialog.tsx (X dos diálogos)

## Como verificar
Medir com evaluate_script o `getBoundingClientRect` de cada alvo, antes e depois. Rodar axe nas telas com tabela e aviso.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
