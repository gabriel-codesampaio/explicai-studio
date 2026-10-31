# T-074: e2e de copiar e colar a imagem falha às vezes na suíte completa

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: qa
- Origem: pedido da pessoa em 2026-10-30

## Problema
O teste "copiar a imagem e colar em outra página usa o mesmo arquivo" (e2e/studio.imagem.e2e.ts) falhou 2 de 4 execuções completas e passa isolado 5 de 5. Suspeita: usa a área de transferência real do sistema, compartilhada entre workers e outras execuções.

## Critérios de aceite
- [ ] Causa medida (skill diagnosticar), sem retry nem sleep fixo.
- [ ] Teste isolado da área de transferência do sistema (ex. evento de cópia/colagem sintético ou contexto serial) e suíte completa verde 3 vezes seguidas.

## Onde
`e2e/studio.imagem.e2e.ts`.

## Como verificar
Teste primeiro; e2e da área; medir no navegador, claro e escuro, 1280 e 375 px.

## Registro
Commit dd7572f (e 23e10dd). Causa medida: o teste copiava antes de o ProseMirror processar a seleção da imagem, e copiava um parágrafo vazio (não era a área de transferência do sistema). Agora espera, por poll, o evento de cópia conter a imagem. 15 execuções com 6 workers: 15 verdes. Fica de fora: a mesma corrida pode existir em outros testes de seleção por teclado.
