# T-535: Imagem do manual de exemplo com mojibake em "Cobranças"

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado B5 (Baixo). Relacionado: T-057 (UTF-8), fechado.

## Problema
No manual de exemplo `docs/exemplo/financeiro`, a imagem do print mostra "CobranÃ§as" (mojibake de "Cobranças"). É o primeiro manual que a pessoa abre; a primeira impressão do produto sai com erro visível.

## Critérios de aceite
- [x] Imagem regerada sem "Ã" nem "§" no texto; nenhuma outra letra acentuada quebrada nas imagens de `docs/exemplo/financeiro/assets`.
- [x] A marcação (`.json` ao lado) continua casando com a nova imagem, ou é refeita.
- [x] Dimensões e peso do arquivo não crescem sem motivo.

## Onde
`docs/exemplo/financeiro/assets/`. Esforço do relatório: P.

## Como verificar
Abrir o exemplo no Studio e no HTML exportado, e olhar o print com o texto corrigido.

## Registro
Coberto por T-556: "CobranÃ§as" virou "Cobranças" em `tela-clientes.svg` (única imagem do exemplo; nenhum outro "Ã" em `docs/exemplo`). Marcação `.json` refeita junto. Peso igual (SVG).
