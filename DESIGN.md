---
name: Explicaí Studio
description: Mesa de revisão digital. Papel claro, caneta azul, marca-texto amarelo e números de marcador.
colors:
  cobalto: "#2b4fe0"
  cobalto-escuro: "#7088ff"
  marca-texto: "#ffd43b"
  nanquim: "#151a33"
  papel: "#f5f6fa"
  superficie: "#ffffff"
  grafite: "#575e78"
  linha: "#dce0eb"
  campo: "#7d849e"
  coral: "#c8411f"
  papel-escuro: "#0e1120"
  superficie-escura: "#161a2e"
  tinta-escura: "#eceef7"
typography:
  display:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Atkinson Hyperlegible Next, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono Variable, ui-monospace, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  base: "3px"
spacing:
  rodape: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.cobalto}"
    textColor: "{colors.superficie}"
    rounded: "{rounded.base}"
    height: "36px"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.nanquim}"
    rounded: "{rounded.base}"
---

# Design System: Explicaí Studio

## Overview

**Creative North Star: "A mesa de revisão"**

Papel claro, caneta azul, marca-texto amarelo e números de marcador. O Studio é ferramenta de trabalho longo: calmo, preciso, didático, sem enfeite. A marca aparece em detalhes exatos (número cobalto, régua amarela), não em decoração. Fonte da verdade das cores: `web/src/styles/tokens.css`. Marca completa: `docs/marca-resumo.md`.

**Key Characteristics:**
- Tema claro (papel) e escuro (tinta azulada), trocados por `data-theme`.
- Raio único de 3 px; sem gradiente; quase sem sombra.
- Um botão principal sólido por tela.
- Numeração mono cobalto (1, 2, 2.1) igual no Studio e no manual exportado.

## Colors

Paleta de caneta e papel: um acento frio, um realce quente raro, neutros azulados.

### Primary
- **Cobalto caneta** (#2b4fe0; escuro #7088ff): ação, link, foco, número de página/passo, marcações sobre o print.

### Secondary
- **Marca-texto** (#ffd43b): só conteúdo realçado e página ativa. No escuro também vira `--acento`.

### Neutral
- **Papel** (#f5f6fa) fundo; **Superfície** (#ffffff) cartões e painéis; **Nanquim** (#151a33) texto; **Grafite** (#575e78) texto secundário; **Linha** (#dce0eb) divisórias; **Campo** (#7d849e) borda de controle (3:1).
- Escuro: papel #0e1120, superfície #161a2e, texto #eceef7, linha #2a3050.
- **Coral** (#c8411f; escuro #ff7f63): destrutivo e erro.
- Alertas do manual: verde, laranja, vermelho e cobalto por tipo; nunca amarelo.

### Named Rules
**The Marca-texto Rule.** Amarelo só em conteúdo realçado e na página ativa. Nunca em botão nem decoração.
**The One Pen Rule.** Um acento (cobalto). Cor nunca é o único sinal.

## Typography

**Display:** Archivo (títulos, nome do manual, largura 105-112%). **Body:** Atkinson Hyperlegible Next. **Label/Mono:** JetBrains Mono (rótulos, números, caminhos, atalhos).

### Hierarchy
- **Display** (800, 2.125rem, 1.25): título da página.
- **Body** (400, 16px, 1.6): texto e interface; 14px (`text-sm`) nos controles.
- **Label** (500, 11px, +0.08em, maiúsculo): classe `rotulo`, rótulo de seção.

## Layout

Barra lateral (árvore de páginas) + editor + barra de status. Rodapés com altura única de 3rem. Abaixo de 900 px (`split`) a barra lateral vira coluna. Painéis fixos reservam a calha da barra de rolagem. Desktop primeiro; no celular só não quebra.

## Elevation & Depth

Plano por padrão: camadas tonais (papel, superfície, secundário) e bordas de 1 px, sem sombra em repouso. Sombra só em menu, diálogo e o pulso do passeio guiado.

## Shapes

Canto quase reto (3 px) em tudo da interface. Arredondado só no símbolo, nos prints e nos marcadores numerados (círculo). Área clicável no print: tracejada.

## Components

### Buttons
- **Shape:** 3 px, altura 36 px (sm 32, xs 24), texto 14px/500.
- **Primary:** cobalto sólido, texto sobre-cobalto; um por tela (Exportar manual).
- **Secondary/Ghost:** texto ou contorno discreto; hover com `--accent` (cobalto 8%).
- **Focus:** anel global de 2 px cobalto com offset 2 px (`:focus-visible`); botões somam anel de 3 px a 50%.

### Inputs / Fields
- **Style:** fundo superfície, borda `--input` (3:1), raio 3 px, cursor cobalto.
- **Focus:** borda e anel cobalto. Título da página: traço inferior cobalto de 2 px mais fundo `--accent`.

### Navigation
Árvore de páginas com numeração mono cobalto; página ativa com marca-texto. Rótulos de seção em `rotulo`.

## Do's and Don'ts

### Do:
- **Do** pôr cor e fonte em `tokens.css`, nunca solta no componente.
- **Do** manter contraste 4,5:1 no texto e foco sempre visível (WCAG 2.2 AA).
- **Do** dizer no botão o que acontece; erro diz como resolver.

### Don't:
- **Don't** usar cara de shadcn padrão (cinza neutro, raio e sombra iguais em tudo).
- **Don't** usar gradiente, ícone decorativo nem robô para falar de IA.
- **Don't** usar humor em erro nem em passo de manual.
