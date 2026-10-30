# Discovery: verificação ortográfica (2026-10-30)

Ideia do caderno (29/10): "Hoje o corretor do navegador já usa o idioma do manual (o artigo da página leva `lang`). Falta decidir se vale um corretor próprio, com dicionário de termos do sistema documentado."

## Problema
Quem escreve manual de um sistema usa nomes que nenhum dicionário conhece: "Novo cliente" passa, mas "CNPJ", "NF-e", "checkout" ou o nome do módulo vira sublinhado vermelho em todo parágrafo. A pessoa aprende a ignorar o sublinhado, e o erro de verdade passa junto. Hoje faz: usa o corretor do navegador e ignora o ruído. Hipótese: não há usuário real que tenha reclamado (PRODUCT.md, "Evidence on Hand").

## O que já existe
- O artigo da página leva `lang={manual.language}` (`web/src/layout/PageView.tsx:45`). O corretor do navegador usa esse idioma, então pt-BR e en já funcionam sem código nosso.
- O HTML exportado também leva `lang` (`src/core/export/html.ts:27`).
- `grep spellcheck` em `web/src` e `src`: nenhum atributo `spellcheck` definido. O navegador decide sozinho (padrão ligado em campos editáveis).
- `manual.json` tem `language`; não tem lugar para vocabulário (`docs/manual-format.md`, "manual.json").
- Dependências atuais: só `marked` e `yaml` em runtime (`package.json`). O editor (Tiptap, React) vai no `devDependencies` e é empacotado em `dist/web`.
- Projeto MIT; "não adicione dependência com licença GPL ou AGPL" (`CLAUDE.md`).
- Sem API de página para acrescentar palavra ao corretor nativo do navegador: o "adicionar ao dicionário" do Chrome é por usuário e vale para todos os sites. Afirmação minha, sem fonte; confirmar no Chrome antes de decidir.

## Concorrentes
Não pesquisei o que Scribe, Tango, GitBook, Confluence e Notion fazem. Hipótese: a maioria deixa o corretor do navegador agir. Antes de decidir, conferir a ajuda de cada um. Fonte nenhuma para afirmar o contrário.

## Opções de peças (licença e peso, verificados no npm em 2026-10-30)
| Peça | Licença | Tamanho descompactado | Observação |
|---|---|---|---|
| [nspell](https://www.npmjs.com/package/nspell) 2.1.5 | MIT | 42 KB | Corretor em JS lê dicionário no formato Hunspell |
| [dictionary-en](https://www.npmjs.com/package/dictionary-en) 4.0.0 | MIT AND BSD | 575 KB | en-US; sem copyleft |
| [dictionary-pt](https://www.npmjs.com/package/dictionary-pt) 4.0.0 | LGPL-3.0 OR MPL-2.0 | 5,5 MB | Vero (pt-BR), [texto da licença](https://cdn.jsdelivr.net/npm/dictionary-pt@4.0.0/license). É dual: escolheríamos MPL-2.0 |
| [typo-js](https://www.npmjs.com/package/typo-js) 1.4.0 | BSD-3-Clause | 2 MB | Alternativa ao nspell, traz dicionário próprio |

Pontos de licença:
- **nspell e dictionary-en são MIT/BSD**: sem problema.
- **dictionary-pt tem LGPL ou MPL, nunca MIT.** MPL-2.0 é copyleft de arquivo: distribuir o dicionário sem alterar e mantendo o aviso é permitido num projeto MIT, e não contamina o nosso código. Mas a regra do projeto diz "nada GPL/AGPL". LGPL/MPL não são GPL/AGPL, e a pessoa precisa dizer se aceita. Não é conselho jurídico.
- **Peso**: 5,5 MB no pt-BR é 10x mais que o resto do pacote do editor. Dá para carregar sob demanda (só o idioma do manual aberto) e fora do bundle principal. Medir o tamanho do `.aff`+`.dic` real depois de empacotar; "descompactado" do npm inclui outros arquivos.
- **Desempenho**: nspell com dicionário grande carrega em centenas de milissegundos e usa memória; fazer em Web Worker é o jeito seguro. Estimativa minha, sem medição.

## Opções
| # | Ganho | Tam. | Riscos | Fora |
|---|---|---|---|---|
| **A** | Nada de corretor próprio. Só deixar o `spellcheck` explícito (`spellcheck="true"` no editor) e documentar como adicionar palavra no navegador | P | Termo do sistema continua sublinhado para sempre; não resolve o ruído | Dicionário do manual |
| B | Lista de termos do manual (`manual.json` → `glossary: ["CNPJ", "NF-e"]`) que **filtra** os sublinhados do navegador | M | Navegador não deixa filtrar o corretor nativo; teria de ser um corretor próprio, que é a C | — |
| C | Corretor próprio com nspell + dicionário do idioma do manual + lista de termos do manual, rodando em Worker; desliga o `spellcheck` nativo | G | Peso (5,5 MB só o pt-BR); licença LGPL/MPL; sublinhado desenhado por decoração do Tiptap (menu de sugestão, teclado, acessibilidade); manter pt-BR e en; conflito com IME e colar de texto longo; formato novo em `manual.json` | Gramática, outros idiomas, correção automática |
| D | Só o **glossário** ligado ao corretor nativo, via lista de palavras ignoradas por manual aplicada em decoração de ruído (esconder o que o navegador marca) | — | Inviável: a página não sabe o que o navegador marcou | — |

**Recomendação: A**, com a opção C só se aparecer pedido real. O corretor nativo resolve o erro comum, e o preço de C é alto: dicionário de 5,5 MB, licença que fura a regra "sem copyleft" se lida à risca, e um sublinhado acessível para construir. O ganho de C (silenciar "CNPJ") não vale isso antes de alguém reclamar. Medir: quantos pedidos de "palavra do meu sistema fica sublinhada" chegam; pedir a quem escreve manual quantas palavras são ruído por página.

Se for C um dia, a ordem é: (1) `glossary` opcional no `manual.json` (campo preservado por `readManual`, sem `FORMAT_VERSION` 2); (2) nspell + dictionary-en primeiro (MIT, sem dúvida); (3) pt-BR só depois da decisão sobre a licença.

## Riscos
- **Formato:** `glossary` em `manual.json` é campo opcional, mas o `explicai-mcp` também deveria usá-lo (para escrever "NF-e" certo). Combinar antes.
- **Ruído do exportado:** o HTML/PDF não tem corretor; só o editor.
- **Marca/Studio:** sublinhado de erro é UI funcional; usar o estilo neutro do corretor, sem cor de marca.
- **Privacidade:** o corretor nativo do Chrome pode enviar texto ao Google se o "corretor aprimorado" estiver ligado (comportamento do navegador, não nosso). Um corretor local em JS evita isso. Ponto a favor de C, não decisivo. Sem fonte; verificar.

## Decisões suas (com recomendação)
1. Vale o corretor próprio agora? → Não. Ficar na A e esperar pedido.
2. Se um dia for C, aceita dependência com licença LGPL/MPL (dictionary-pt, só como dado, sem alteração)? → Aceitar MPL-2.0, que não é GPL/AGPL; registrar a exceção em `CLAUDE.md`. A decisão é sua.
3. O glossário de termos vive em `manual.json`? → Sim, `glossary` opcional, quando o C for feito. Vale também para o MCP.
4. Idiomas: só pt-BR e en? → Sim, os dois que o Studio já oferece.

## Rascunho de spec (opção A)
- **Escopo:** `spellcheck="true"` explícito e `lang` conferido no contêiner editável do Tiptap (`web/src/features/editor`). Uma frase em `docs/` e no help do Studio dizendo como adicionar uma palavra ao dicionário do navegador. Sem dependência nova, sem mudança de formato.
- **Critérios de aceite:**
  - No editor, o campo editável tem `lang` igual ao `manual.language` e `spellcheck` ligado, verificado no DOM.
  - Trocar o idioma do manual troca o `lang` do editor sem recarregar.
  - O help explica como adicionar palavra ao dicionário do navegador.
  - Nenhuma dependência nova no `package.json`.
- **Riscos:** o atributo `lang` do contêiner do Tiptap pode não chegar no `contenteditable` certo; testar em Chrome e Edge. Não resolve o ruído de termos do sistema (assumido).

Não verificado: o que cada concorrente faz; que o navegador não aceita lista de palavras da página; tamanho real dos arquivos `.aff`/`.dic` empacotados; tempo de carga do nspell.

## Decisões tomadas (2026-10-30)
- Por enquanto, só o corretor do navegador e uma explicação na ajuda. → [T-036](../tickets/T-036-corretor-do-navegador.md)
- Levantamento de bibliotecas de correção: [libs de correção](archives/2026-10-30-libs-de-correcao.md).
