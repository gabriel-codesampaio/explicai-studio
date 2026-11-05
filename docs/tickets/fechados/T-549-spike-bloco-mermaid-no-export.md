# T-549: Spike: blocos mermaid renderizados no export, medindo peso e segurança

- Prioridade: P3
- Tamanho: M
- Status: aberto
- Agente: core (+ design)
- Origem: [relatório de features 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), feature 10 (esforço G, risco M). Este ticket é spike: medição e decisão, não entrega.

## Problema
Fluxo ("o pedido passa por aprovação") só cabe hoje como lista ou print de outra ferramenta. Hipótese: manual de sistema usa fluxo com frequência; sem evidência ainda.

## Escopo do spike
- Peso do pacote Mermaid, com e sem a lib (KB).
- Licença da árvore de dependências (MIT; nada GPL/AGPL).
- Segurança: `securityLevel`, CSP (T-082).
- Tema escuro e fonte do manual.
- Texto alternativo do diagrama (a11y).
- Caminho: renderizar no HTML e no PDF, ou gerar SVG na exportação para não levar a biblioteca ao HTML.

## Critérios de aceite
- [ ] Relatório curto no Registro: peso, licença, `securityLevel`, e a decisão (ir, SVG na exportação, ou não ir).
- [ ] Prova: um bloco ```mermaid de exemplo renderizado no HTML exportado e no PDF, ou o motivo da falha.
- [ ] O export continua de acordo com a CSP (T-082).
- [ ] Nenhuma entrega de produto neste ticket. Se a decisão for ir, abre ticket de entrega com spec.

## Onde
`src/core/export/html.ts`, `src/core/export/pdf` (o que existir), `package.json` (só para medir).

## Como verificar
Medição de tamanho do bundle, relatório de licenças e os dois exports de exemplo.

## Decisões pendentes
5. **Mermaid: vale o spike agora?** Recomendação do relatório: não. Só quando um manual real precisar de fluxo; o MCP já descreve fluxo em lista numerada. Este ticket só anda com a decisão da pessoa.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
