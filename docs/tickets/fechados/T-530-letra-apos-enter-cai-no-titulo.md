# T-530: Reproduzir a letra que cai no título depois do Enter

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado M5 (Médio). Achado ainda não confirmado à mão.

## Problema
Em página nova, um teste automático digitou "Entrar no sistema", Enter e "Abra o endereço…": o título virou "Entrar no sistemaA" e o corpo "bra o endereço…". Só apareceu com a primeira tecla logo após o Enter (intervalo zero); com 30 a 120 ms o problema não aparece. Provável corrida: o foco vai ao corpo um instante depois do Enter. Pessoa lenta provavelmente não vê; quem digita rápido ou usa expansor de texto vê.

## Critérios de aceite
- [x] Reproduzir primeiro: digitar à mão (ou com teste sem pausa) "Título", Enter e a primeira letra do corpo. Registrar no Registro se reproduz, com a versão e o navegador.
- [x] Se reproduzir: o foco vai ao corpo de forma síncrona no keydown do Enter; a letra logo após o Enter entra no corpo. Teste de regressão com digitação sem pausa.
- [x] Se não reproduzir: fechar como descartado com a evidência no Registro.

## Onde
`web/src/features/editor/Editor.tsx` e o tratador de Enter do título. Esforço do relatório: P.

## Como verificar
Script com digitação com 0 ms e com 100 ms entre Enter e a primeira letra; conferir o texto do título e do corpo.

## Registro
- Reproduzido: Playwright com Enter e texto em fila (sem await entre as teclas) dava título "Entrar no sistemaA" em 3 de 3 (Chrome estável, Studio 1.0.0). Causa: `editor.commands.focus("start")` do Tiptap espera um frame. Corrigido com seleção e `view.focus()` na hora (`focusStart` em PageView). Teste e2e em e2e/studio.lote2a.e2e.ts.
