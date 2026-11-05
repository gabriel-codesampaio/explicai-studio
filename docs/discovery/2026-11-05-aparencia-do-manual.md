# Discovery: experiência da modal "Aparência do manual" (2026-11-05)

Pedido: melhorar o uso da modal "Aparência do manual" (Ajustes). Só leitura: nenhum código alterado, nenhum ticket criado. Complementa o item 5 das sugestões de [UI/UX e features do 1.0.0](2026-11-05-relatorio-ui-ux-e-features.md) ("dividir em abas") e não repete [aparência e públicos](archives/aparencia-sidebar-e-perfis.md) nem [capa e rodapé](archives/capa-e-rodape.md). O `caderno.md` não tinha entrada sobre isso.

## Problema
Quem monta um manual para um cliente (dev ou software house) quer que o HTML e o PDF tenham a cara do cliente (cor, fonte, logo, capa) e precisa ver o efeito de cada escolha enquanto escolhe. Hoje a modal tem tudo, mas a amostra some da tela assim que a pessoa rola até fontes, logo ou capa, e a modal é uma parede única de 2,4 telas. Hipótese: nenhum usuário real reclamou ainda (PRODUCT.md, "Evidence on Hand"); os achados vêm da medida e da leitura do código.

## Como olhei
Playwright headless (Chrome instalado), 1 largura (1280x800), tema claro, pt-BR, cópia de `docs/exemplo/financeiro` em pasta temporária, servidor do `dist/` em porta livre. Medidas por script, prints no scratchpad (`a1-abre.png`, `a2-fim.png`, `a4-erro.png`). Mobile e escuro **não medidos** (largura e tema únicos, como pedido); o que vai sobre eles abaixo é leitura de código e fica marcado como hipótese.

## O que existe (medido)
- Diálogo 1024x768; área rolável com 1618 px de conteúdo num campo de 678 px: **2,4 telas**. 45 controles focáveis. 6 seções: Cores (9 cores), Fontes (2 grupos de chips), Logo, Capa e rodapé (5 campos + prévia própria), Rodapé do Explicaí, Amostra.
- Amostra na 2ª coluna (`lg`), **sem sticky** (`ManualAppearanceDialog.tsx:53-55`, comentário "sem sticky"). Medido: depois de rolar até o fim, a amostra fica em `top = -807 px`, fora da tela. A coluna direita fica vazia da metade da modal para baixo (`a2-fim.png`).
- A amostra não mostra logo, capa nem rodapé. A capa tem uma prévia separada, lá embaixo (`CoverFooterFields.tsx:82`). Logo não tem prévia no contexto.
- Cada campo salva ao sair dele (blur/Enter). Não há botão "Salvar" nem aviso de "salvo"; a barra de status do Studio fica atrás do diálogo.
- Ordem de Tab: título, cor do texto, hex, cor de destaque, hex, Padrão, 4 atalhos de destaque, cor de realce... o fluxo é por tipo de campo, não por tarefa ("quero a cor do cliente").

## Atritos
| # | Atrito | Evidência | Área |
|---|---|---|---|
| F1 | Amostra sai da tela ao rolar; trocar fonte, logo ou capa não mostra efeito na amostra (ela nem tem logo/capa) | `a2-fim.png`; amostra em top -807 px | pré-visualização |
| F2 | Cinco cores de título com o mesmo peso visual das duas cores principais (destaque, texto). Quem só quer "a cor do cliente" vê 9 linhas iguais | `a1-abre.png`: 5 amostras pretas em fila | hierarquia |
| F3 | Padrão dos títulos mostra `#000000` (preto puro, fora da paleta nanquim `#151a33`) | `ThemeFields.tsx:14`; já era B4 do relatório de 1.0.0 | defaults |
| F4 | Atalhos de cor só para o destaque (4). O realce não tem atalho, embora a marca tenha 5 realces com contraste validado (`docs/marca-resumo.md`) | `ThemeFields.tsx:8-13` | defaults |
| F5 | Sem "voltar tudo ao padrão do manual". "Padrão" existe por campo | `ColorField.tsx`; grep `Redefinir` sem resultado | fluxo |
| F6 | Erro de contraste aparece colado ao campo, empurra os atalhos para baixo (layout salta) e o campo mantém contorno vermelho depois de voltar ao valor antigo | `a4-erro.png` | fluxo |
| F7 | Ao fechar com Esc o foco **não volta ao gatilho**: medido, vai para "Pular para o conteúdo". O relatório de 1.0.0 dizia que Aparência devolvia; aqui não devolveu quando aberta pelo menu Ajustes (o item do menu some). A confirmar com o botão direto | `document.activeElement` após Esc | acessibilidade |
| F8 | Amostra é `aria-hidden` (ok para decoração), mas nada anuncia o que mudou ao escolher uma cor ou fonte; a única voz viva é a da capa (`aria-live`, `CoverFooterFields.tsx:133`) | `ThemeSample.tsx:44` | acessibilidade |
| F9 | Hipótese (código, não medi): abaixo de `lg` a amostra vem **depois de todas as seções** (`ManualAppearanceDialog.tsx:53`), ~1600 px abaixo dos campos. No celular a pessoa muda a cor e não vê nada mudar | leitura de código | mobile |

O que está bom e não mexer: hex mais seletor mais "Padrão" por campo; contraste validado no core com mensagem que diz o número e o mínimo; salvar ao sair do campo (Esc também salva); nome acessível em todos os campos (0 sem rótulo); alvos de toque (só o `input` do logo, oculto, e 2 caixas de seleção ficam abaixo de 24 px, com o rótulo cobrindo a área).

## Referências
- **GitBook**: a customização do site vive numa aba do próprio site, com título e logo primeiro, depois tema e cor principal, e um passo de "visualizar enquanto muda, depois Salvar". Logo em duas versões (claro e escuro); cores semânticas e fontes próprias só nos planos pagos. A prévia detalhada não aparece na documentação, então não afirmo como é ([Ícones, cores e temas](https://gitbook.com/docs/docs-site/customization/icons-colors-and-themes), [guia](https://gitbook.com/docs/guides/customizing-your-site)). Leitura: "identidade primeiro (logo, cor), refinos depois" é a ordem que F2 pede. O "Salvar" explícito deles difere do nosso "salva sozinho", que serve melhor aqui (manual local, sem publicar).
- **Scribe**: marca (logo, cores, fontes) é configuração de equipe na página de Settings, com Editar e ícone de Reset para remover o logo ([Add a custom logo](https://scribehow.com/viewer/Add_a_custom_logo_to_your_Scribe_documents__zuHbcIVXSmyrsN8hiwXSBA)). Cor e fonte aparecem só em listagens de terceiros, sem passos; não afirmo mais que isso. Leitura: tem Reset explícito (F5).
- **Tango, Confluence, Notion**: não busquei nesta rodada; sem afirmação.
- **Padrões W3C** (de memória, não abertos nesta sessão): modal devolve o foco ao elemento que a abriu ([APG, Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)); WCAG 2.4.3 Focus Order e 4.1.3 Status Messages, para F7 e F8.

O que dá para fazer diferente: o Studio já tem prévia ao vivo com o CSS real do export (`themeCss`). Basta **não deixá-la sair da vista**.

## Opções
| # | Ganho | Tam. | Arquivos | Riscos | Fora |
|---|---|---|---|---|---|
| **A** (corte mínimo) | Amostra sempre à vista em `lg` (sticky na coluna direita); cores dos títulos recolhidas em "Cor dos títulos" com um seletor só e "Ajustar por nível" sob demanda; padrão dos títulos em nanquim; foco volta ao gatilho; erro de cor sem pulo de layout | P | `ManualAppearanceDialog.tsx`, `ThemeFields.tsx`, `ColorField.tsx` (linha do erro reservada), gatilho em `MoreMenu.tsx`; e2e que usam `Título 1..3` | Recolher os títulos muda como os testes acham os campos; sticky pede teste de rolagem | Abas, mobile, presets, Reset geral, logo/capa na amostra |
| B | A + abas "Cores", "Fontes" e "Logo e capa" com a amostra fixa ao lado; a aba da capa troca a amostra pela prévia da capa e do rodapé; em tela estreita a amostra vira faixa fixa no topo do corpo | M | A + `ManualAppearanceDialog.tsx` em abas (Radix Tabs, se já houver em `components/ui`), `CoverFooterFields.tsx` (prévia sobe), `ThemeSample.tsx` (variante compacta) | Aba esconde campo; salvar-ao-sair precisa seguir valendo ao trocar de aba | Presets, Reset geral, logo na amostra |
| C | B + conjuntos prontos (cor + fonte) e atalhos de realce da marca; "Voltar tudo ao padrão do manual" com desfazer; amostra com logo e capa | G | B + lista de conjuntos, `ThemeSample.tsx`, `LogoField.tsx` | Conjunto pronto vira decisão de marca; Reset geral apaga `theme` inteiro e a armadilha de `setManualTheme` (sem `accent` apaga tudo, ver [voz do manual](2026-10-30-voz-do-manual.md)) pede função própria; risco de cara de gerador de tema | Tema por público, logo claro/escuro |

Formato de dados: **nenhuma opção muda `manual.json`**; C só grava os mesmos campos de `theme`.

## Recomendação: A
É a menor que resolve o que a pessoa sente (não ver o efeito) e não mexe no formato. B só vale se, depois de A, a rolagem de 2,4 telas ainda for queixa; C só se alguém pedir "o mesmo visual para vários manuais". O que observar depois: (1) quem muda fonte ou logo ainda abre a exportação para conferir? (sinal de que a prévia de capa/logo precisa subir); (2) pedem Reset geral?; (3) uso em celular. Os três ainda são hipótese, sem usuário real.

## Encaixe na marca
O Studio fica sóbrio: A não traz cor nem enfeite, só reorganiza. O cobalto segue no botão e no foco; as cores de atalho são conteúdo do manual, não tema do Studio. Presets (C) são o ponto em que a marca precisa opinar.

## Riscos
- **Formato:** nenhum.
- **Testes:** `e2e/studio.e2e.ts:516` e `:1096`, `studio.lote6.e2e.ts` e `studio.menus-axe.e2e.ts` abrem a modal. Recolher os títulos mexe nos nomes `Título da capa… Título 3`; manter os rótulos acessíveis ao abrir "por nível".
- **Sticky em diálogo rolável:** testar em 800 e 600 px de altura; a amostra tem 362 px.
- **Mobile e escuro sem medida:** antes de implementar B, medir 375 e escuro.

## Decisões suas (com recomendação)
1. Fazer só A agora? → Sim.
2. O padrão dos títulos passa a nanquim `#151a33` (sai o `#000000`)? Muda o export de manuais que nunca escolheram cor de título, então vale linha no CHANGELOG. → Sim.
3. Recolher as 5 cores de título numa só? → Sim, com "Ajustar por nível" fechado por padrão.

## Rascunho de spec (opção A)
**Escopo**
1. Em `lg`, a amostra fica fixa (`sticky top-0 self-start`) na coluna direita enquanto a esquerda rola. Abaixo de `lg`, sem mudança (fica para B).
2. Cores dos títulos: um campo "Cor dos títulos" que grava as cinco posições; "Ajustar por nível" abre os cinco campos atuais (já aberto se os níveis tiverem cores diferentes).
3. Padrão dos títulos em `#151a33` na interface e no export, se a decisão 2 for sim.
4. Erro de cor com a linha reservada (sem empurrar o layout); contorno vermelho só enquanto o erro existir.
5. Ao fechar a modal (Esc ou botão), o foco volta ao "Ajustes" de onde ela abriu.

**Critérios de aceite**
- A 1280x800, depois de rolar a modal ao fim, a amostra continua inteira na tela (top >= 0 e bottom <= viewport).
- A cor única dos títulos atualiza os 5 níveis na amostra e em `manual.json`; "Ajustar por nível" mostra e salva cada nível; com níveis diferentes, abre aberto.
- Cor com contraste menor que 4,5:1 mostra o erro sem mudar a posição dos campos abaixo (medir `top` de "Cor de realce" antes e depois) e o erro some ao corrigir.
- Esc e Fechar devolvem o foco ao botão Ajustes (`document.activeElement`).
- E2E existentes passam com os rótulos novos; axe sem violação nova na modal (`studio.menus-axe.e2e.ts`).
- `manual.json` sem `theme` exporta como antes, salvo o padrão dos títulos (decisão 2).

**Riscos**
- Testes que acham `Título 1..3` por rótulo precisam abrir "Ajustar por nível".
- Mudar o padrão dos títulos muda o export de manuais antigos.
- Sticky e `overflow-y-auto` no mesmo contêiner: conferir em 600 px.

**Fora:** abas, celular, presets, Reset geral, logo e capa na amostra, logo claro/escuro.
