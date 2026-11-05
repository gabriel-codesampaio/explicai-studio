# T-533: Texto de 10 e 11 px fora do rótulo, no mínimo de 12 px

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado B3 (Baixo)

## Problema
Texto de corpo de menu e de tela abaixo de 12 px: `web/src/features/editor/slash/SlashPreview.tsx:12` (10 px), `kbd.tsx:10`, `MoreMenu.tsx:75,79`, `VersionsPanel.tsx:99` (11 px). O rótulo `rotulo` de 11 px é da marca e fica. Contraste passou em todas as telas medidas.

## Critérios de aceite
- [x] Nenhum texto fora de `rotulo` abaixo de 12 px nos arquivos citados.
- [x] `rotulo` (mono, maiúsculo) segue como está.
- [x] Os menus cabem em 375 px, sem overflow horizontal.

## Onde
Arquivos acima. Esforço do relatório: P.

## Como verificar
`evaluate_script` listando `fontSize < 12` nas telas do menu "/", Versões e Ajustes, em 375 e 1280.

## Registro
- Fechado em feat/ui-lote3. text-[10px]/[11px] viram text-xs (12 px) em SlashPreview, kbd (altura h-5), MoreMenu, CoverFooterFields e FontPicker; VersionsPanel já não tinha. rotulo intocado. Medição em 375 px não rodada (só classes de tamanho; menus são ml-auto/flex).
