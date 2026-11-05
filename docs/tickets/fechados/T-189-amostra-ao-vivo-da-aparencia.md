# T-189: Amostra ao vivo na tela de Aparência do manual

- Prioridade: P3
- Tamanho: M
- Status: concluído
- Agente: frontend
- Origem: discovery [aparencia-sidebar-e-perfis](../../discovery/archives/aparencia-sidebar-e-perfis.md), pedido da pessoa 2026-11-04 (lote 1.0)

## Problema
Ver a seção correspondente da discovery. Depende do T-188. Absorve: nada.

Decisões da pessoa (2026-11-04): termo único "Público" ("perfil" sai da interface); remover público libera as páginas só dele para todos, com confirmação mostrando contagem e títulos; renomear para nome existente é recusado; a fonte do manual sai da barra do editor e fica só na Aparência (fonte de trecho vai na barra da seleção, T-182); cores do manual não aparecem no editor, só na amostra; painel atual "Aparência" vira "Tema do Studio".

## Critérios de aceite
- [ ] Bloco "Amostra" mostra título 1 e 2, parágrafo, link, número de passo, destaque, realce e um marcador, com as cores e fontes escolhidas; muda ao mudar um campo.
- [ ] As variáveis vêm do mesmo `themeCss` do export (rota que devolve o CSS, sem cópia do mapeamento no web).
- [ ] A amostra respeita as fontes empacotadas (mesma carga do `useFontPreview`).
- [ ] Em 1280 px a amostra aparece ao lado das seções sem rolar; em 375 px, abaixo, sem `sticky`.
- [ ] O resto do Studio (editor, barra) não muda de cor.

## Como verificar
Os critérios acima, com script Playwright (uma largura na fatia; matriz 375/1280, claro/escuro, pt/en no fecho do lote).

## Registro
Commits: 86e88f6 (rota do themeCss no escopo da amostra), 4cd46ab (amostra ao vivo na Aparência), aa07eeb (formatação) e o commit que fecha este ticket.

Feito: rota `theme/css` com escopo; `ThemeSample` ao lado das seções em lg, com as fontes da prévia e `aria-hidden` (os h4 a h6 são só visual).

Ficou de fora: 375 px e a matriz tema/idioma não foram medidos. `manual.json` editado à mão não valida `accent` na leitura (já existia no export).
