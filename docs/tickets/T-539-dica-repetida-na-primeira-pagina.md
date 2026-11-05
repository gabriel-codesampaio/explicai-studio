# T-539: Tirar a dica repetida e o botão duplicado da primeira página

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado B9 (Baixo). Relacionado: T-018 e T-148, fechados.

## Problema
Em `40-primeira.png` e `43-tour.png`, o cartão "Comece pelo primeiro print" e o placeholder do editor ("Cole um print com Ctrl+V") dizem o mesmo. Em manual vazio há dois botões que criam página: "Nova página" e "Criar a primeira página".

## Critérios de aceite
- [ ] Na página vazia fica uma dica só para colar print.
- [ ] Em manual sem páginas fica um botão só para criar a primeira página.
- [ ] O botão que sobra segue acessível por teclado e com nome.

## Onde
Estado vazio do editor e tela de manual sem páginas. Esforço do relatório: P.

## Como verificar
e2e de primeiro uso existente; um print por estado (manual vazio e página vazia).

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
