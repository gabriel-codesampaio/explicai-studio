# T-142: Status da página vira só a bolinha na árvore

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa (2026-11-04), com print em `explicai/../images` da sessão

## Problema
Na árvore o status "Publicado" ocupa a linha com a palavra inteira e tira espaço do título.

## Decisão
Só a bolinha colorida. O nome do status fica em tooltip e em texto para leitor de tela: cor nunca é o único sinal. Junto do T-141 (mesma área).

## Critérios de aceite
- [x] Bolinha com `title` e nome acessível com o nome do status, em todos os estados.
- [x] Contraste da bolinha medido; estados distinguíveis também sem cor (nome acessível). Ganho de largura medido.

## Registro
Árvore usa `StatusMark`: bolinha de 8 px com `title` e texto só para leitor de tela; a busca (Ctrl+P) e o topo da página seguem com o nome. e2e novo confere título e largura. Rascunho segue sem marca, como antes.
