# T-081: Duas marcas visíveis com a gaveta aberta abaixo de 900 px

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: revisão de design e de código do lote 6 (2026-11-02)

## Problema
Com a gaveta aberta, a Brand da MobileBar e a do Sidebar aparecem juntas (dois role=img "Explicaí Studio").

## Critérios de aceite
- [ ] Só uma marca exposta por vez (aria-hidden na da barra enquanto a gaveta está aberta) e teste cobrindo.

## Onde
web/src/layout/Navigation.tsx (MobileBar), web/src/layout/Sidebar.tsx

## Como verificar
Teste da área e medida por script no navegador.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
