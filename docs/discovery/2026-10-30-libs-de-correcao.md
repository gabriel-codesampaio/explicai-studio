# Discovery: bibliotecas para correção futura (2026-10-30)

Complementa [verificação ortográfica](2026-10-30-ortografia.md). Não repete o que está lá (nspell, dictionary-pt, opções A a D).

Decisão da pessoa: por enquanto fica o corretor do navegador, com explicação na ajuda. Este arquivo é um mapa para o dia em que isso não bastar. Ortografia, gramática e estilo (frase longa, voz passiva, termo do sistema escrito de jeitos diferentes).

## Problema
Quem escreve manual quer três coisas diferentes, e cada uma pede uma peça diferente:
1. **Ortografia** sem ruído de termo do sistema.
2. **Gramática e estilo** (frase longa, voz passiva, palavra repetida).
3. **Consistência de termos**: "check-out" numa página, "checkout" em outra, "Nota Fiscal" e "NF-e" misturados.

Hoje faz: corretor do navegador, e revisão a olho. Hipótese: nenhum usuário real pediu (PRODUCT.md, "Evidence on Hand").

## Achado principal
**Quase toda a ferramenta de estilo é só para inglês.** O que serve a pt-BR em gramática pesada é o LanguageTool. O resto (frase longa, voz passiva, termo do glossário) em pt-BR sai de regra nossa, pequena, porque as bibliotecas prontas não cobrem o idioma.

## Tabela comparativa
Licença, versão e peso: `npm view` em 2026-10-30 (peso = `dist.unpackedSize`, descompactado, inclui arquivos que não vão para o navegador). "Último release" é a data de `time.modified` do npm.

| Candidata | Licença | pt-BR | en | Onde roda | Peso | Offline | Último release | Fonte |
|---|---|---|---|---|---|---|---|---|
| nspell 2.1.5 | MIT | Sim, com dictionary-pt | Sim | Navegador e Node | 42 KB (+ dicionário) | Sim | 2022-06 | [npm](https://www.npmjs.com/package/nspell) |
| dictionary-pt 4.0.0 | LGPL-3.0 OR MPL-2.0 | Sim | - | Dado (arquivos .aff/.dic) | 5,5 MB | Sim | 2023-11 | [npm](https://www.npmjs.com/package/dictionary-pt) |
| dictionary-en 4.0.0 | MIT AND BSD | - | Sim | Dado | 575 KB | Sim | 2023-11 | [npm](https://www.npmjs.com/package/dictionary-en) |
| typo-js 1.4.0 | BSD-3-Clause | Dicionário que você traz | Sim, traz | Navegador e Node | 2 MB | Sim | 2026-10 | [npm](https://www.npmjs.com/package/typo-js) |
| hunspell-asm 4.0.2 | MIT | Sim (dicionário Hunspell) | Sim | Navegador e Node (WASM) | 4,9 MB | Sim | 2022-06 | [npm](https://www.npmjs.com/package/hunspell-asm) |
| nodehun 3.0.2 | MIT | Sim (dicionário Hunspell) | Sim | **Só Node** (módulo nativo) | 7,2 MB | Sim | 2022-06 | [npm](https://www.npmjs.com/package/nodehun) |
| @cspell/dict-pt-br 2.4.4 | **GPL-3.0-or-later** | Sim | - | Dado | 1,8 MB | Sim | 2026-10 | [npm](https://www.npmjs.com/package/@cspell/dict-pt-br) |
| cspell 10.4.0 | MIT | Só com o dicionário GPL acima | Sim | Node (feito para código e CLI) | 229 KB (+ cspell-lib 578 KB) | Sim | 2026-10 | [npm](https://www.npmjs.com/package/cspell) |
| retext 9 + unified | MIT | Parser de texto em inglês (`retext-english`); sem parser pt | Sim | Navegador e Node | 10 KB | Sim | 2023-09 | [npm](https://www.npmjs.com/package/retext) |
| retext-spell 6.1.0 | MIT | Sim, com nspell + dicionário | Sim | Navegador e Node | 25 KB | Sim | 2024-02 | [npm](https://www.npmjs.com/package/retext-spell) |
| retext-readability 8.0.0 | MIT | **Não**: fórmulas de leitura em inglês (Flesch, SMOG etc.) | Sim | Navegador e Node | 19 KB | Sim | 2023-09 | [npm](https://www.npmjs.com/package/retext-readability), [readme](https://raw.githubusercontent.com/retextjs/retext-readability/main/readme.md) |
| retext-passive 5.0.0 | MIT | **Não**: olha verbos auxiliares ingleses (is, was, been...) | Sim | Navegador e Node | 15 KB | Sim | 2023-09 | [npm](https://www.npmjs.com/package/retext-passive), [readme](https://raw.githubusercontent.com/retextjs/retext-passive/main/readme.md) |
| retext-repeated-words 5.0.0 | MIT | Hipótese: serve (palavra repetida não depende de idioma); testar | Sim | Navegador e Node | 13 KB | Sim | 2023-09 | [npm](https://www.npmjs.com/package/retext-repeated-words) |
| retext-equality 7.1.0 / alex 11.0.1 | MIT | **Não** (inglês) | Sim | Navegador e Node / CLI | 164 KB / 38 KB | Sim | 2024-05 / 2023-08 | [npm](https://www.npmjs.com/package/retext-equality), [npm](https://www.npmjs.com/package/alex) |
| write-good 1.0.8 | MIT | **Não** (listas de palavras inglesas) | Sim | Navegador e Node | 42 KB | Sim | 2022-06 | [npm](https://www.npmjs.com/package/write-good) |
| textlint 15.8.0 + textlint-rule-prh 6.1.1 | MIT | Motor serve a qualquer idioma; regras prontas são mais japonesas e inglesas | Sim | Node (CLI) | 236 KB + 50 KB | Sim | 2026-08 / 2026-10 | [npm](https://www.npmjs.com/package/textlint), [npm](https://www.npmjs.com/package/textlint-rule-prh) |
| Vale (binário Go) | MIT | Regras de estilo escritas por você; vocabulário vale para qualquer idioma. Ortografia só com dicionário Hunspell | Sim | Binário externo, não é pacote npm | - | Sim | Não verificado | [repo](https://github.com/errata-ai/vale), [vocabulário](https://docs.vale.sh/keys/vocabularies.md) |
| Harper (harper.js 3.0.0) | Apache-2.0 | **Não**: "currently only supports English" | Sim | Navegador (WASM) e Node | **94,8 MB** descompactado no npm | Sim | 2026-10 | [npm](https://www.npmjs.com/package/harper.js), [README](https://raw.githubusercontent.com/Automattic/harper/master/README.md) |
| LanguageTool | LGPL 2.1 ou mais novo (núcleo) | **Sim** | Sim | Servidor Java com HTTP; não roda no navegador | Não medi (Java + pacote de dados) | Sim, no servidor local; regras de IA só na nuvem | Não verificado | [repo](https://github.com/languagetool-org/languagetool), [servidor](https://dev.languagetool.org/http-server) |
| LanguageTool, API pública | O serviço, não o código | Sim | Sim | HTTP externo | - | **Não** (envia o texto para fora) | - | [limites](https://dev.languagetool.org/public-http-api) |

Notas que a tabela não cabe:
- **Harper**: a licença Apache-2.0 vem do npm. O README não a diz. Os 94,8 MB são do pacote npm inteiro; o que o navegador baixa é menos, mas não medi.
- **LanguageTool, API pública**: 20 requisições por minuto por IP, 20 KB por requisição, 75 KB por minuto, e link visível para languagetool.org. Pede instância própria para uso automático. Não serve a uma ferramenta offline que roda em `localhost`.
- **LanguageTool, servidor local**: o guia manda instalar Java 8 ou mais novo, rodar `HTTPServer` na porta 8081 e `POST /v2/check`. Só ouve localhost, a não ser com `--public`. O mesmo guia diz que as regras de IA só existem na nuvem. A licença LGPL do núcleo é a do repositório; a do pacote de dados e dos n-gramas não verifiquei.
- **Vale**: precisa de binário. O `npx explicai` não o traz. Serve como modelo de ideia, não como dependência.
- **cspell**: ótimo para código, mas o único dicionário pt-BR dele é GPL-3.0. Fora.

## Licenças: resumo
- **Sem decisão necessária (MIT, BSD, Apache):** nspell, typo-js, hunspell-asm, retext e plugins, textlint, write-good, alex, Harper, dictionary-en.
- **Pedem decisão sua (LGPL/MPL):** dictionary-pt (escolheríamos MPL-2.0) e LanguageTool. No LanguageTool o ponto muda: se rodar como processo separado e a pessoa instalar por conta própria, o Studio não distribui nem liga o código. Não é conselho jurídico.
- **Proibido pela regra do projeto (GPL):** `@cspell/dict-pt-br`.

## Como cada peça entraria

| Onde | O que cabe | Observação |
|---|---|---|
| **Editor (Tiptap 3, decorações)** | nspell, retext, regras próprias | Rodar em Web Worker. Cada bloco de texto vira uma entrada; o resultado volta como `Decoration.inline` num plugin do ProseMirror. Sublinhado e menu de sugestão são nossos |
| **Servidor `node:http` local** | LanguageTool (via `POST` para a porta 8081), textlint, nodehun | Rota nova em `src/server/routes/`. O Studio só consulta; o Java é processo à parte, opcional, que a pessoa liga |
| **`explicai-mcp` (ferramenta)** | Checagem de glossário, retext, textlint | Mais barata aqui: roda no Node, sem peso de navegador, e a IA corrige o que o relatório mostrar. Pode ser `verificar_manual` que devolve lista de achados por página |
| **Linha de comando / CI** | textlint, Vale | Fora do Studio. Para quem quer travar o merge de um manual |

## Glossário de termos do sistema
Já proposto no discovery anterior: `glossary` opcional em `manual.json`. Aqui o formato e o uso.

```json
"glossary": [
  { "term": "checkout", "avoid": ["check-out", "check out"] },
  { "term": "NF-e", "avoid": ["NFe", "nota fiscal eletrônica"] },
  { "term": "CNPJ" }
]
```

Uma lista só serve a três usos:
1. **Ortografia:** todo `term` entra como palavra aceita no nspell (`spell.add(term)`). Some o ruído de "CNPJ".
2. **Consistência:** todo `avoid` vira achado ("Use 'checkout'"). É uma busca de texto em cada bloco, com limite de palavra. Cerca de 30 linhas, **sem biblioteca**. A ideia é a mesma do `accept.txt`/`reject.txt` do Vale.
3. **Escrita pela IA:** o `explicai-mcp` lê a lista e escreve o termo certo desde o primeiro rascunho.

Sem o nspell, só o uso 2 e 3 já valem: não dependem de dicionário, de licença nem de idioma. **É a parte mais barata e a que mais responde à queixa do caderno** (termo escrito de jeito diferente em páginas diferentes).

Cuidados: `avoid` dentro de bloco de código e de link não conta; maiúscula e minúscula (Vale trata o termo como sensível a maiúsculas; decidir o nosso); `readManual` já preserva campos desconhecidos, então não pede `FORMAT_VERSION` 2.

## Opções
| # | Ganho | Tam. | Riscos | Fora |
|---|---|---|---|---|
| **A** | Glossário com `term`/`avoid`: achados de consistência no editor e no MCP, regra própria, zero dependência | P/M | Formato novo em `manual.json` (opcional); regra de maiúscula; falso positivo em código | Ortografia e gramática |
| B | A + estilo simples nosso: frase longa (contagem de palavras), palavra repetida. Vale para pt-BR e en | M | Limite de "longa" é gosto; fórmula de legibilidade em pt-BR não existe pronta | Voz passiva (em pt-BR precisa de análise gramatical) |
| C | B + ortografia própria: nspell + dictionary-en (MIT) em Worker, e pt-BR depois da decisão de licença | G | Peso (5,5 MB), Worker, sublinhado acessível, IME e colar texto longo | Gramática |
| D | C + LanguageTool local opcional para gramática pt-BR e en | G | Exige Java, processo à parte, LGPL, sem regras de IA offline, pouca previsibilidade de memória (não medi) | Navegador sem servidor |

**Recomendação: A, depois B.** O problema do caderno que é de verdade nosso é a consistência de termos. Nenhuma biblioteca o resolve melhor que 30 linhas e uma lista no `manual.json`, e nenhuma delas depende de idioma. Ortografia fica com o navegador, como você decidiu. Gramática pesada só com LanguageTool, e só se alguém pedir, como processo opcional.

Medir antes de subir: quantos termos o glossário tem em manuais reais; quantos `avoid` acertam de verdade; se alguém pede ortografia sem ruído (C) ou gramática (D).

## Riscos
- **Formato:** `glossary` é campo novo em `manual.json`. Opcional, mas o MCP e o Studio precisam concordar no formato antes de fixar.
- **Idioma:** `retext-passive`, `retext-readability`, `write-good` e `alex` olham inglês. Em um manual pt-BR eles dariam sinal falso ou nada. Não ligar por idioma errado.
- **Peso:** Harper (94,8 MB no npm) e dictionary-pt (5,5 MB) mudam o tamanho do `npx explicai`. Medir o que vai de fato para `dist/web`.
- **Manutenção:** nspell, hunspell-asm, nodehun e write-good não têm release desde 2022; retext e plugins desde 2023. É código pequeno e estável, mas sem dono ativo. typo-js, cspell, textlint e Harper estão ativos (2026).
- **Marca:** sublinhado e achado são UI de trabalho; estilo neutro, sem cor de marca.
- **Privacidade:** LanguageTool em API pública envia o texto do manual para fora. Não usar. Só o servidor local.

## Decisões suas (com recomendação)
1. Fazer o glossário de termos (opção A) antes de qualquer corretor? → Sim.
2. O glossário vale para o Studio e para o `explicai-mcp`? → Sim, os dois leem o mesmo campo.
3. Aceita LGPL/MPL, só como dado (dictionary-pt) ou como processo externo (LanguageTool)? → Sim para os dois, quando chegar a hora; registrar em `CLAUDE.md`. Hoje não precisa.
4. O LanguageTool entra como recurso opcional que a pessoa liga, nunca embutido? → Sim.
5. Regras de estilo em pt-BR (frase longa, repetida): escrever as nossas? → Sim, pequenas e só quando o glossário estiver em uso.

## Rascunho de spec (opção A)
- **Escopo:** campo opcional `glossary` (`term`, `avoid[]`) em `manual.json`, lido e preservado pelo core (`src/core/manuals`). Função pura `checkGlossary(markdown | blocos, glossary)` que devolve achados `{ page, de, para, termo, sugestão }`, ignorando código e link. Mostrar os achados no editor como decoração neutra com a sugestão. Ler o campo no `explicai-mcp`. Documentar em `docs/manual-format.md`. Sem dependência nova.
- **Critérios de aceite:**
  - Um `avoid` encontrado fora de código e de link vira um achado com a sugestão do `term`.
  - O mesmo texto dentro de bloco de código ou link não gera achado.
  - Manual sem `glossary` abre e salva como antes; `web/test/markdown.test.ts` passa.
  - `readManual` preserva o campo; o `FORMAT_VERSION` continua 1.
  - O editor mostra o achado sem travar em página longa (teste com uma página grande; medir).
  - `package.json` sem dependência nova.
  - `docs/manual-format.md` descreve o campo.
- **Riscos:** sensibilidade a maiúsculas (decidir: ignorar maiúscula na busca, respeitar no `term`); o MCP precisa aceitar o mesmo formato; achados em excesso viram o mesmo ruído do sublinhado do navegador.

## Não verificado
- Se `retext-repeated-words` funciona em português (hipótese; testar).
- Último release, peso, memória e tempo de resposta do LanguageTool; licença do pacote de dados.
- Tamanho real do que Harper e nspell mandam ao navegador depois do build.
- Se o Harper já tem outro idioma além do inglês (README e busca dizem que não; sem conferir o changelog).
- Última versão do Vale.
- Como Scribe, Tango, GitBook, Confluence e Notion tratam consistência de termos.
