# Discovery: cor no texto selecionado e estilos do manual (2026-10-30)

Complementa [logo e cor do manual](2026-10-30-customizacao-marca.md). Aquele trata da cor de destaque do manual inteiro. Este trata da cor por trecho e dos blocos com sentido.

Ideia: "personalizar as cores quando o usuário seleciona texto, abrir um menu de personalização. Precisamos de uma customização do manual."

## O amarelo do print
É a cor de seleção do Studio, não marca-texto: `web/src/styles/base.css:20` usa `::selection { background: var(--marca-faixa) }` (`tokens.css:15`, rgba(255,212,59,.55)). Fere o brand book (`docs/marca-resumo.md:6`: marca-texto só para conteúdo realçado e página ativa) e o T-011, porque o texto selecionado fica igual ao "Resultado:". Hipótese: o amarelo deu a impressão de que já existia realce. Correção barata: seleção em cobalto ~20%, junto do T-011.

Hoje não há menu flutuante. A barra é fixa (negrito, itálico, código, link, imagem; `Toolbar.tsx:39-50`). A extensão bubble-menu já vem com `@tiptap/react`, mas nenhuma extensão de realce, cor ou aviso está registrada (`extensions.ts`).

## Problema
Quem escreve quer chamar a atenção do leitor para um aviso, uma dica ou um termo importante. Hoje só há negrito e citação, e a citação dentro de um passo já vira o "Resultado:". Hipótese: ainda sem usuário real que confirme.

## Achados que mudam a conta
- `docs/spec-v1.md:25` promete o bloco **aviso (info, atenção, erro)** na v1, e ele não existe.
- O export HTML escapa todo HTML do corpo (`src/core/export/html.ts:79-82`, `manual-format.md:105`). `<mark>` ou `<span style>` sairiam como texto cru. Cor livre por trecho exigiria abrir essa barreira de segurança.
- O Markdown para IA (`export/markdown.ts:22`) copia o corpo como está: sintaxe própria aparece crua, mas legível.
- `@tiptap/markdown` aceita tokenizer próprio; a doc tem receita de `==texto==` e de bloco `:::tipo` ([highlight](https://github.com/ueberdosis/tiptap-docs/blob/main/src/content/editor/markdown/guides/create-a-highlight-mark.mdx), [admonition](https://github.com/ueberdosis/tiptap-docs/blob/main/src/content/editor/markdown/guides/create-a-admonition-block.mdx)).
- O `explicai-mcp` grava Markdown e precisaria conhecer a sintaxe nova (código dele não verificado).

## Concorrentes
| Produto | O que faz | Fonte |
|---|---|---|
| Notion | Menu na seleção: ~10 cores de texto e ~10 de fundo, paleta fixa | [ajuda](https://www.notion.com/en-gb/help/customize-and-style-your-content) |
| Confluence | Cor de texto e realce (7 cores); painel info/nota/sucesso/aviso/erro; avisa para escolher cores que funcionem nos dois temas | [painel](https://confluence.atlassian.com/spaces/CONF94/pages/1540722127/Panel+Macro), [info/aviso](https://confluence.atlassian.com/confcloud/info-tip-note-and-warning-macros-724765216.html) |
| GitBook | Sem cor por trecho; hint em 4 estilos fixos com sintaxe no Markdown | [hint](https://gitbook.com/docs/creating-content/blocks/hint) |
| Scribe | Cor de realce no texto das Pages | [anúncio](https://scribe.launchnotes.io/announcements/format-and-style-your-text-in-scribe-steps) |
| Tango | Callout entre os passos, com tipo e cor por tipo | [ajuda](https://help.tango.ai/en/articles/7885358-can-i-add-callouts-to-my-tango) |

Padrão: ferramentas de manual (GitBook, Tango) usam blocos com sentido e cor ligada ao tipo; as de uso geral (Notion, Confluence) dão paleta por trecho. Onde ser diferente: a aparência do aviso sai do tema do manual e funciona no claro, no escuro e na impressão sem ninguém escolher cor.

## Opções
| # | Ganho | Tam. | Riscos | Fora |
|---|---|---|---|---|
| 0 | Seleção deixa de ser amarela | P | Nenhum | Tudo abaixo |
| **1** | Bloco aviso (Dica, Atenção, Erro) pelo `/` e pelo seletor de bloco, aparência no tema do export, salvo como alerta GFM `> [!TIP]` / `> [!WARNING]` / `> [!CAUTION]` | M | Colisão com o "Resultado:" dentro do passo; renderer próprio de `blockquote` no export | Cor por trecho |
| 2 | 1 + realce marca-texto por trecho (`==texto==`, uma cor só) num menu na seleção | M/G | Sintaxe fora do CommonMark; `==` em texto comum; tokenizer no export e no MCP | Paleta |
| 3 | Paleta de cor de texto e fundo por trecho (estilo Notion) | G | HTML inline quebra a regra "HTML sai como texto"; contraste nos dois temas e na impressão; formato muda | — |

**Recomendação: 0 + 1.** Entrega o que a spec v1 já promete, não mexe na barreira de HTML e não precisa de `FORMAT_VERSION` (alerta GFM continua sendo blockquote para qualquer leitor, e o GitHub o desenha). A cor vem do tema e o Studio segue sóbrio. Depois, observar se as pessoas usam negrito ou aviso para realçar palavras soltas: se sim, a opção 2 vale. Recusar a 3.

## Acessibilidade
Cor livre por trecho não garante 4,5:1 nos dois temas nem na impressão, e cor não pode ser o único sinal (`marca-resumo.md:17`). O aviso leva rótulo em texto ("Atenção:") além da cor.

## Decisões suas (com recomendação)
1. Tipos de aviso: Dica, Atenção, Erro (spec v1) ou incluir Nota/Info? → Os três, mais Nota (`[!NOTE]`).
2. Aviso dentro de um passo? → Sim, distinto do "Resultado:" pelo `[!TIPO]`.
3. Cor do aviso: a de destaque do manual ou fixa por tipo? → Fixa por tipo, testada nos dois temas; só a Nota usa a cor de destaque.
4. Trocar a cor da seleção já, no T-011? → Sim.

## Rascunho de spec (opção 0 + 1)
- **Escopo:** nó `callout` (attr `type`: tip, warning, caution, note), parse e render de `> [!TYPE]\n> texto`. Item no `/` e no seletor de bloco. CSS discreto no editor e no `html.ts` (renderer de `blockquote` que reconhece `[!TYPE]`, com rótulo em texto). Markdown para IA sem mudança. Documentar em `docs/manual-format.md`. Seleção do Studio em cobalto translúcido.
- **Critérios de aceite:**
  - Inserir pelo `/`, salvar e reabrir deixa o aviso igual, também dentro de um item de passo (teste em `web/test/markdown.test.ts`).
  - O "Resultado:" existente continua salvo e aberto igual.
  - HTML e PDF mostram rótulo + texto, com contraste ≥ 4,5:1 no claro e no escuro, legível impresso.
  - Manual antigo exporta igual. HTML colado continua escapado.
  - A seleção de texto no Studio não usa mais `--marca`.
- **Riscos:** blockquote ambíguo (passo, resultado, aviso); MCP gravando aviso em sintaxe que o Studio não reconhece; citação comum virando aviso por engano.

Não verificado: código do `explicai-mcp`, suporte nativo do marked 17 a alertas, telas no navegador.
