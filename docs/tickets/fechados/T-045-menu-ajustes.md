# T-045: Menu Ajustes com Idioma próprio, ícones e cursor de mão

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: Pedido da pessoa sobre o menu "Ajustes" do T-040 (2026-10-30)

## Problema
"Idioma da interface" ficava escondido dentro de Aparência. Os itens do menu não mostravam cursor de mão e eram difíceis de achar de relance.

## Decisão: ícones ficam
A pessoa pediu ícones nos itens do menu depois da discovery do rodapé, que recomendava não usá-los. Eles servem para achar o item rápido, não para decorar. **O T-007 (tirar ícones decorativos) não deve removê-los.** Usam lucide-react, `size-3.5`, `aria-hidden`, cor muted que fica forte no item destacado; o texto continua sendo o nome acessível: Lixeira `Trash2`, Aparência `SunMoon`, Idioma `Languages`, Atalhos `Keyboard`, gatilho `Settings`.

## Critérios de aceite
- [x] "Idioma" é item próprio de Ajustes, com o idioma atual em mono à direita, e abre o próprio painel.
- [x] Aparência mostra só o tema.
- [x] Textos em pt e en.
- [x] `cursor: pointer` no gatilho e em todos os itens de menu (base shadcn), exceto desabilitados.
- [x] Ícones como na decisão acima; alvos de 44 px em toque mantidos.
- [x] e2e "barra enxuta" e "tela estreita" cobrem Idioma; novo e2e do painel.

## Onde
`web/src/layout/MoreMenu.tsx`, `web/src/features/settings/` (AppearancePanel, LanguagePanel novo), `web/src/components/ui/dropdown-menu.tsx`, `web/src/lib/i18n.en.ts`, `e2e/studio.e2e.ts`.

## Registro
Branch feature/t-045-menu-ajustes. `npm run check` verde, e2e 27/27. Conferido no Chrome em 1280 px no escuro, em inglês. Não conferido a olho: claro e 375 px (o e2e mede os 44 px em toque).
