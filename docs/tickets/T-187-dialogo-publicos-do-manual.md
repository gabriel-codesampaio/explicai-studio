# T-187: Diálogo "Públicos do manual" nos Ajustes

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: discovery [aparencia-sidebar-e-perfis](../discovery/aparencia-sidebar-e-perfis.md), pedido da pessoa 2026-11-04 (lote 1.0)

## Problema
Ver a seção correspondente da discovery. Depende do T-186 (termo "Público" já decidido, T-158). Absorve: **T-135** (trava de dois cliques), **T-136** (matriz de tela), **T-172** (nome acessível do popover). Cada um vira critério abaixo; fechar os três com referência a este ticket.

Decisões da pessoa (2026-11-04): termo único "Público" ("perfil" sai da interface); remover público libera as páginas só dele para todos, com confirmação mostrando contagem e títulos; renomear para nome existente é recusado; a fonte do manual sai da barra do editor e fica só na Aparência (fonte de trecho vai na barra da seleção, T-182); cores do manual não aparecem no editor, só na amostra; painel atual "Aparência" vira "Tema do Studio".

## Critérios de aceite
- [ ] Item "Públicos" no menu Ajustes, só com manual aberto; o popover da página ganha o link "Gerenciar públicos…".
- [ ] Lista com nome e contagem de páginas; renomear na linha (Enter grava, Esc cancela); criar sem página; remover.
- [ ] Remover com páginas mostra a confirmação com a contagem e os títulos das páginas que passam a aparecer para todos; foco inicial em Cancelar; sem páginas, um clique.
- [ ] Erros (nome repetido, comprimento) aparecem junto ao campo com o motivo.
- [ ] T-172: o popover de público e o diálogo novo têm nome acessível; axe sem violação nos dois.
- [ ] T-135: dois cliques seguidos no menu não disparam duas gravações, ou a última escolha vence e o menu mostra o valor gravado (e2e com resposta atrasada).
- [ ] T-136: conferido em 375 e 1280, claro e escuro, pt e en; só com teclado; leitor de tela anuncia nome e estado.
- [ ] Sem cor nova; tokens do Studio; destrutivo só na confirmação.

## Como verificar
Os critérios acima, com script Playwright (uma largura na fatia; matriz 375/1280, claro/escuro, pt/en no fecho do lote).

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
