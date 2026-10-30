# Discovery: rodapé da barra lateral (2026-10-30)

Relacionado: [botão Exportar](2026-10-30-botao-exportar.md) (mesma sessão, outro canto da tela). Ideia do caderno (#app): "Menu inferior da esquerda não tá bacana, pensar num style bacana".

## Problema
Quem edita um manual precisa, de vez em quando, abrir a Lixeira, trocar tema/idioma ou ver os atalhos. Hoje o rodapé da barra é um "⋯" solto no canto, sem texto, que não diz o que guarda. Hipótese: ninguém reclamou além da própria pessoa (PRODUCT.md não traz usuário real); a queixa é de acabamento e de descoberta.

## O que está ruim (visto no navegador, 1280 px e 375 px, pt-BR)
Medido com Edge via Playwright (`npm run build && node dist/cli.js exemplos --no-open --port 4411`).
- **Sem rótulo.** Um botão de 32x32 px com três pontinhos, 12 px da borda, no fim de uma coluna vazia de ~600 px. Só `aria-label`/`title` dizem "Mais opções". Quem vê não sabe que Lixeira, Aparência e Atalhos moram ali.
- **Mesmo glifo, dois sentidos.** A linha de cada página na árvore também termina em "⋯" ("Mais ações para ..."). Dois "⋯" na mesma coluna, um para página, outro para o app.
- **Nada do que está dentro aparece.** O menu abre para cima com três itens de texto, sem estado (qual tema está ativo), sem dica de atalho, sem agrupamento. É a única parte da barra que não usa o vocabulário dos vizinhos: "Buscar página" tem texto, ícone e `Ctrl+P` em mono; "Nova página" tem texto em cobalto.
- **Menu estreito (128 px)** colado à borda esquerda, menor que a coluna (252 px). Parece suspenso, não ancorado.
- **Tela estreita (375 px):** igual. A gaveta mostra o mesmo "⋯" no fundo; o menu cabe (x 12 a 140, y 642 a 748 numa janela de 800), sem corte. O gatilho mede 0x0 na medição de 375 px só porque a gaveta ainda não estava aberta quando medi; o e2e "tela estreita" já cobre abrir e fechar. Não revi o gatilho de 44 px (`[@media(pointer:coarse)]:size-11`) em dispositivo de toque real.
- **Alinhamento do separador:** `border-t` a 12 px das bordas, ok. O que destoa é o botão (32 px) alinhado à esquerda sem relação com o texto acima (que começa em 8 px de padding interno, mais 12).

## O que já existe (código)
- `web/src/layout/MoreMenu.tsx` (50 linhas): `DropdownMenu` do shadcn com gatilho de ícone; três itens; cada um abre um painel (`TrashPanel`, `AppearancePanel`, `ShortcutsDialog`) controlado por `panel`. Rodapé = `mt-auto border-t border-border pt-3`.
- Usado só em `web/src/layout/Sidebar.tsx:99`.
- Contrato nos testes: e2e `barra enxuta` (`e2e/studio.e2e.ts:354`) e `tela estreita` (`:381`) buscam `button "Mais opções"` e `menuitem` Lixeira/Aparência/Atalhos e exigem foco de volta no gatilho. A ordem decidida em T-006 ("Exportar só no topo") manteve a barra sem Exportar.
- Estilos da linha "Buscar página" (`Sidebar.tsx:63-70`): `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground`, com `kbd` mono. É o modelo a copiar.
- Strings em `web/src/lib/i18n.en.ts`. Formato em Markdown e `manual.json`: não é tocado. Sem risco de `FORMAT_VERSION`.

## O que os outros fazem
| Produto | Rodapé / ajustes da barra | Fonte |
|---|---|---|
| Notion (layout antigo) | Settings, Templates e Trash juntos no fim da barra, como linhas com rótulo | [Notion Help](https://www.notion.com/help/navigate-with-the-sidebar) |
| Notion (layout novo) | My Tasks, Library, Marketplace, Help e Trash sempre acessíveis no fim da aba Home; nome do workspace no fim da barra | [Notion Help](https://www.notion.com/help/navigate-with-the-sidebar) |
| Linear | Não encontrei descrição do rodapé na documentação; só diz que a troca de workspace fica no canto superior esquerdo | [Linear Docs](https://linear.app/docs/conceptual-model) |
| Confluence, Obsidian, GitBook, Scribe, Tango | Não verifiquei (a busca não achou página que descreva o rodapé; a doc do Obsidian que tentei deu 404). Hipótese, sem fonte: usam engrenagem ou menu de perfil | — |

O que dá para tirar com segurança: Notion usa **linhas com rótulo**, não um ícone mudo, para as coisas raras (Lixeira, Configurações, Ajuda). O resto é hipótese e não entra na decisão.

## Dentro da marca (docs/marca-resumo.md)
- "Ícone só quando identifica a ação sem texto; decorativo sai": ícone em Lixeira/Aparência/Atalhos seria decorativo. Texto basta.
- Rótulo de seção em mono maiúsculo (`rotulo`), atalho em mono (`kbd`), raio 3 px, sem sombra pesada, nada de gradiente nem cor nova. O botão principal (cobalto sólido) é Exportar; o rodapé não pode competir: texto cinza (`text-muted-foreground`), foco visível.
- Amarelo marca-texto é só para conteúdo realçado e página ativa; não usar no rodapé.
- O Studio é sóbrio: o "style bacana" aqui é clareza e ritmo igual ao do resto da barra, não decoração.

## Acessibilidade e tela estreita
- Alvo: WCAG 2.2 AA pede alvo mínimo de 24 px; hoje 32 px (ok) e 44 px em toque. Uma linha de largura total ganha área de clique grande sem custo.
- Nome acessível: hoje "Mais opções" é genérico. Com rótulo visível ("Ajustes" ou "Mais"), nome visível = nome acessível (WCAG 2.5.3, rótulo no nome). O e2e precisa mudar o nome buscado.
- Contraste do `text-muted-foreground` sobre `bg-card` no claro e no escuro: não medi. Medir no ticket (4,5:1).
- Foco volta ao gatilho ao fechar o painel: já funciona (Radix) e é critério de e2e; manter.
- Gaveta de 375 px: a linha de largura total deixa de depender de acertar um alvo de 32 px com o polegar. Menu com a mesma largura da coluna evita corte.

## Opções
| # | Ganho | Tam. | Arquivos / partes | Riscos | Fora |
|---|---|---|---|---|---|
| **A** | Gatilho vira linha com texto "Ajustes" (ou "Mais"), do mesmo estilo de "Buscar página"; menu com a largura da linha; "Aparência" mostra o valor atual em mono (ex.: "Claro"); "Atalhos" mostra a tecla, se houver. Sem ícone nos itens. | P | `MoreMenu.tsx`, `i18n.en.ts`, e2e (nome do botão em 2 testes) | Escolher o rótulo; abrir o valor do tema exige ler o contexto de tema (verificar se `AppearancePanel` expõe) | Agrupamento, novos itens, ícones |
| B | Sem menu: três linhas de texto fixas no rodapé (Lixeira, Aparência, Atalhos), cada uma abre o painel direto. Um clique a menos, tudo visível. | P-M | `MoreMenu.tsx` (sai `DropdownMenu`), e2e (sem `menuitem`), css | Desfaz a decisão "barra enxuta" de T-006; come ~100 px de altura; pouco espaço para crescer | Menu para itens futuros |
| C | A + conta/idioma/versão do app e rodapé com status de salvamento movido para cá | G | Barra, status do rodapé da página, i18n | Mexe em duas áreas, sem pedido de usuário; foge de "enxuta" | — |

## Recomendação: A
O problema real é "não sei o que há aí" e "parece solto". Texto + mesma linguagem da barra resolve os dois, mantém o menu (a pessoa já decidiu que a barra é enxuta) e mexe em um arquivo. B é a segunda escolha se, depois de A, alguém ainda disser que não acha a Lixeira.

Observar depois: a pessoa (ou quem testar) acha a Lixeira sem ajuda? A Lixeira é usada? Sem dado de uso hoje (não há telemetria; hipótese). Se a Lixeira só for aberta após excluir página, B perde o sentido e uma ação "Desfazer" no aviso de exclusão resolve melhor, fora deste escopo.

## Decisões da pessoa (com recomendação)
1. Rótulo do gatilho: "Ajustes", "Mais" ou "Menu"? → "Ajustes". "Mais" repete o "Mais ações" da árvore, e Lixeira não é ajuste, mas "Ajustes" é o que a pessoa já espera achar ali.
2. Mostrar o tema atual ao lado de "Aparência" e a tecla em "Atalhos"? → Sim para o tema (feedback de estado, mono). Atalhos: só se já houver tecla global; hoje não verifiquei.
3. Ícone no gatilho (engrenagem)? → Não. Marca: ícone decorativo sai, e o texto já identifica.
4. Manter o menu ou mostrar as três linhas (B)? → Manter (A), por causa de T-006 e da barra enxuta.
5. O rodapé ganha mais itens (Ajuda, versão do app)? → Não agora.

## Rascunho de spec (opção A)
- **Escopo:** `web/src/layout/MoreMenu.tsx`: trocar o gatilho de ícone por botão de largura total com texto "Ajustes", classes iguais às de "Buscar página" (`Sidebar.tsx:63`), `data-[state=open]:bg-muted`, alvo mínimo 44 px em `pointer:coarse`. Menu com `align="start"` e largura da linha (`w-[var(--radix-dropdown-menu-trigger-width)]`). Item "Aparência" com o modo atual em `font-mono text-xs text-muted-foreground` à direita. Sem ícones nos itens. Atualizar `i18n.en.ts` e o nome do botão nos e2e `barra enxuta` e `tela estreita`. Sem mudança no formato dos dados.
- **Critérios de aceite:**
  - O gatilho mostra texto visível; nome acessível = nome visível.
  - Menu tem a mesma largura da linha em 1280 px e em 375 px, sem corte.
  - Lixeira, Aparência e Atalhos abrem seus painéis; Esc fecha só o painel e devolve o foco ao gatilho (e2e existentes seguem verdes com o novo nome).
  - "Aparência" mostra o tema atual e atualiza ao trocar.
  - Contraste do texto >= 4,5:1 no claro e no escuro; foco visível.
  - Nenhuma cor nova, ícone novo ou sombra nova.
  - Verificação visual nos dois temas e nas duas larguras.
- **Riscos:** o nome do botão muda e quebra e2e se esquecido; ler o tema atual pode exigir expor estado do `AppearancePanel`; o menu largo pode ficar sem relação com o painel aberto por cima.

## Não verificado
Comportamento em dispositivo de toque real; contraste medido; rodapé do Linear, Confluence, Obsidian, GitBook, Scribe e Tango; se existe tecla global para Atalhos.
