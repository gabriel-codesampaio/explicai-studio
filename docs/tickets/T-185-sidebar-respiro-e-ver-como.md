# T-185: Sidebar: mais respiro no cabeçalho e "Ver como" acima da busca

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: discovery [aparencia-sidebar-e-perfis](../discovery/aparencia-sidebar-e-perfis.md), pedido da pessoa 2026-11-04 (lote 1.0)

## Problema
Ver a seção correspondente da discovery. Absorve: nada. Usa o termo do T-158 se já decidido.

Decisões da pessoa (2026-11-04): termo único "Público" ("perfil" sai da interface); remover público libera as páginas só dele para todos, com confirmação mostrando contagem e títulos; renomear para nome existente é recusado; a fonte do manual sai da barra do editor e fica só na Aparência (fonte de trecho vai na barra da seleção, T-182); cores do manual não aparecem no editor, só na amostra; painel atual "Aparência" vira "Tema do Studio".

## Critérios de aceite
- [ ] Ordem na barra: manual, Ver como (só com público cadastrado), Buscar página, PÁGINAS com "Nova página", árvore.
- [ ] "Ver como" com rótulo `rotulo` acima do select de largura cheia, no mesmo padrão do bloco MANUAL.
- [ ] Respiro medido: pelo menos 12 px entre Ver como, Buscar página e a linha PÁGINAS, e 8 px da linha PÁGINAS à primeira página (script, 1280 px).
- [ ] Sem público cadastrado, nenhum espaço vazio onde estaria o Ver como.
- [ ] Em 768 px de altura a árvore mostra pelo menos 6 páginas sem rolar a coluna (manual de 10 páginas).
- [ ] Alvos de 44 px em tela de toque continuam.
- [ ] Textos em pt e en; e2e do público atualizado se dependia da posição.

## Como verificar
Os critérios acima, com script Playwright (uma largura na fatia; matriz 375/1280, claro/escuro, pt/en no fecho do lote).

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
