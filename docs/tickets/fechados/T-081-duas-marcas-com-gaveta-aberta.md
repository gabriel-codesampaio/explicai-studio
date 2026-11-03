# T-081: Duas marcas visíveis com a gaveta aberta abaixo de 900 px

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: revisão de design e de código do lote 6 (2026-11-02)

## Problema
Com a gaveta aberta, a Brand da MobileBar e a do Sidebar aparecem juntas (dois role=img "Explicaí Studio").

## Critérios de aceite
- [x] Só uma marca exposta por vez (aria-hidden na da barra enquanto a gaveta está aberta) e teste cobrindo.

## Onde
web/src/layout/Navigation.tsx (MobileBar), web/src/layout/Sidebar.tsx

## Como verificar
Teste da área e medida por script no navegador.

## Registro
Branch `fix/t-081-uma-marca-na-gaveta`. MobileBar ganha `drawerOpen` e põe a Brand em aria-hidden enquanto a gaveta está aberta (App passa `sidebar.drawerOpen`). Teste novo web/test/mobileBar.test.tsx (2). Medido em 375: 1 role=img exposto com a gaveta aberta.
