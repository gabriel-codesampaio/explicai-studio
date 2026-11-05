# T-538: Uma só mensagem para a queda de conexão

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado B8 (Baixo). Relacionado: T-262 e T-114, fechados.

## Problema
Com o servidor fora (`60-servidor-caiu.png`), aparecem duas mensagens: uma faixa no topo ("Sem conexão… será salvo quando o servidor voltar") e, no rodapé, "Não foi possível salvar… Tentar de novo". Dizem coisas diferentes (salva sozinho x tente de novo). A faixa também desloca só a coluna principal, não a barra lateral.

## Critérios de aceite
- [ ] Um estado só de queda, com a ação certa: "será salvo quando o servidor voltar" enquanto a conexão não volta; "Tentar de novo" só quando o salvamento falhou de fato.
- [ ] A faixa não deixa a barra lateral desalinhada.
- [ ] Textos em pt e en (T-206).
- [ ] Nenhum texto perdido na queda (T-047 segue valendo).

## Onde
Faixa de conexão e rodapé de status (procurar "Sem conexão" em `web/src`). Esforço do relatório: P.

## Como verificar
e2e derrubando o servidor: ver uma mensagem só, com a ação coerente; print da tela (um por estado).

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
