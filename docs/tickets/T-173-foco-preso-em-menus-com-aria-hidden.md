# T-173: Conferir o foco nos menus abertos com fundo aria-hidden

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: qa
- Origem: relatório UX 2026-11-04, achado B3 (avaliado no commit 60a0e3d)

## Problema
Achado B3, axe sério, critério 4.1.2. Há elementos focáveis dentro de `aria-hidden` no fundo com menus abertos. O foco parece preso no menu. Os menus são do Radix. Confirmar com leitor de tela se o foco escapa; se escapar, corrigir.

## Critérios de aceite
- [ ] Axe sem violação de elemento focável dentro de aria-hidden com cada menu aberto.
- [ ] Tab e Shift+Tab ficam dentro do menu aberto e não vão para o fundo.
- [ ] Teste com leitor de tela registrado no Registro (qual leitor, o que foi ouvido).

## Onde
- Menus do Radix usados pelo Studio (confirmar a lista ao começar).

## Como verificar
Abrir cada menu, rodar axe e ciclar Tab. Repetir com um leitor de tela. Registrar o resultado no Registro.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
