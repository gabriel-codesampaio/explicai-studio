# T-188: "Aparência do manual" nos Ajustes, fora da exportação

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: discovery [aparencia-sidebar-e-perfis](../discovery/aparencia-sidebar-e-perfis.md), pedido da pessoa 2026-11-04 (lote 1.0)

## Problema
Ver a seção correspondente da discovery. Absorve: **T-160** (fonte do manual em lugar com alcance claro), (decidido: a fonte sai da barra do editor).

Decisões da pessoa (2026-11-04): termo único "Público" ("perfil" sai da interface); remover público libera as páginas só dele para todos, com confirmação mostrando contagem e títulos; renomear para nome existente é recusado; a fonte do manual sai da barra do editor e fica só na Aparência (fonte de trecho vai na barra da seleção, T-182); cores do manual não aparecem no editor, só na amostra; painel atual "Aparência" vira "Tema do Studio".

## Critérios de aceite
- [ ] Item "Aparência do manual" nos Ajustes (só com manual aberto) abre a tela com seções Cores, Fontes, Logo e "Sem o rodapé do Explicaí"; cada campo salva sozinho, como hoje.
- [ ] `ExportDialog` não tem mais cor, fonte, logo nem a caixa do rodapé; mostra formato, só aprovadas, público e um ponteiro "Cores, fontes, capa e rodapé: Aparência do manual" que abre a tela (HTML e PDF).
- [ ] Painel atual "Aparência" renomeado para "Tema do Studio" no menu e no título; nota dele e descrição do diálogo de exportação apontam o lugar certo (pt e en).
- [ ] Mesmas validações de contraste e mesmas mensagens de hoje (4,5:1); nenhum campo novo no `theme`.
- [ ] Fonte: `FontMenu` sai da barra do editor, a fonte do manual continua refletindo ao vivo no editor, e a fonte de um trecho selecionado fica separada (T-160). Nome da fonte inteiro em 1280 e 375 px (scrollWidth x clientWidth).
- [ ] 375 e 1280, claro e escuro: sem rolagem horizontal; foco preso e devolvido ao fechar; teclado completo.
- [ ] e2e que usava as cores pelo diálogo de exportação aponta para a tela nova.
- [ ] `grep` por "Cores do manual" e "Sem o rodapé do Explicaí" em `ExportDialog.tsx` não acha mais nada.

## Como verificar
Os critérios acima, com script Playwright (uma largura na fatia; matriz 375/1280, claro/escuro, pt/en no fecho do lote).

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
