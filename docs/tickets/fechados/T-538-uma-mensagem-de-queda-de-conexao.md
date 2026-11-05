# T-538: Uma só mensagem para a queda de conexão

- Prioridade: P3
- Tamanho: P
- Status: fechado
- Agente: frontend
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado B8 (Baixo). Relacionado: T-262 e T-114, fechados.

## Problema
Com o servidor fora (`60-servidor-caiu.png`), aparecem duas mensagens: uma faixa no topo ("Sem conexão… será salvo quando o servidor voltar") e, no rodapé, "Não foi possível salvar… Tentar de novo". Dizem coisas diferentes (salva sozinho x tente de novo). A faixa também desloca só a coluna principal, não a barra lateral.

## Critérios de aceite
- [x] Um estado só de queda, com a ação certa: "será salvo quando o servidor voltar" enquanto a conexão não volta; "Tentar de novo" só quando o salvamento falhou de fato.
- [x] A faixa não deixa a barra lateral desalinhada.
- [x] Textos em pt e en (T-206).
- [x] Nenhum texto perdido na queda (T-047 segue valendo).

## Onde
Faixa de conexão e rodapé de status (procurar "Sem conexão" em `web/src`). Esforço do relatório: P.

## Como verificar
e2e derrubando o servidor: ver uma mensagem só, com a ação coerente; print da tela (um por estado).

## Registro
- Fechado em feat/ui-lote3. StatusBar ganhou o estado offline (PageView: serverDown + erro de salvamento): rodapé mostra 'Aguardando o servidor' (pt/en), sem 'Não foi possível salvar' nem 'Tentar de novo'; a ação fica na faixa 'Tentar agora'. Faixa subiu para fora do main, cobrindo a largura toda (e2e mede x=0 e largura da janela). Testes: web/test/statusBar.test.tsx e studio.erros.e2e.ts (11 verdes). Falha com servidor no ar segue com Tentar de novo. Sem print.
