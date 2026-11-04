# Discovery: editar a capa e o rodapé do manual exportado

Pedido da pessoa, com as palavras dela: "quero uma feature pra poder editar a página inicial e também os rodapés". E: "faça o discovery de algo, nesse discovery, quero que você utilize tbm skills voltadas pra UX".

Complementa: `2026-10-30-contribuicao.md` (rodapé do manual é do cliente, sem link do Explicaí), `2026-10-30-voz-do-manual.md`, T-124 (público, fechado) e `personalizar-marcacoes.md` (tema). Data: 2026-11-04.

## Leitura do pedido

"Página inicial" = a capa do HTML/PDF exportado. "Rodapé" = rodapé do HTML e do PDF. O print era de versão antiga; o código atual (T-132) já tem na capa: logo, título, "N páginas, cerca de X min de leitura" e "Comece por" (`src/core/export/html.ts:65-69`). Não achei outra leitura plausível (o Studio não tem "página inicial" editável). Se ela quis a tela inicial do Studio, é outro discovery.

## Problema

Quem entrega o manual ao cliente (consultor, dev, analista) quer que a capa e o rodapé digam de quem é o documento, qual versão e para quem. Hoje a capa só aceita título, logo e cor, e o único rodapé é o fixo "Manual feito com o Explicaí Studio" (`labels.ts`), que só se desliga com `hideColophon`. O contorno de hoje seria editar o HTML à mão ou escrever isso numa página do manual (hipótese; sem entrevista).

## Hoje no código

- Capa: `<header class="cover">` com logo, `h1`, linha de leitura e "Comece por". Na impressão a capa ocupa uma página (`html.ts:318`).
- Rodapé: `<footer class="colophon">` uma vez, no fim do `main`; no PDF só aparece depois da última página. O PDF é impresso por Chrome headless com `--no-pdf-header-footer` (`pdf.ts:66`), então não há número de página nem rodapé por página.
- Estado: `theme` em `manual.json` (cores, fontes, logo, `hideColophon`), editado em `web/src/features/export/ThemeFields.tsx` e `LogoField.tsx`, dentro de `ExportDialog.tsx` ("Cores do manual", `<details>`, cada campo salva sozinho). Validação em `mergeTheme` (`theme.ts`), compartilhada com o MCP (`explicai-mcp/src/tools.ts`).
- Markdown exportado não usa `theme` (regra em `docs/manual-format.md`).
- Público (T-124, fechado): `exportManual(dir, formato, { audience })`; o diálogo mostra o seletor quando há perfis.

## Fora

Scribe e Tango não apareceram na busca: nada afirmado sobre eles (lacuna).

| Ferramenta | O que faz | Fonte |
|---|---|---|
| Document360 | Modelo de PDF com capa, cabeçalho e rodapé, número de página (1, 2, 3 ou "Página 1 de 10"; esquerda, centro, direita). Cabeçalho e rodapé valem para todas as páginas, menos a capa | [docs.document360.com](https://docs.document360.com/docs/export-to-pdf.md) |
| GitBook clássico (legado) | `book.json` com `pdf.pageNumbers` e modelo de rodapé com variáveis `_PAGENUM_`, `_TITLE_`, `_AUTHOR_`, `_SECTION_`; capa por arquivo `cover.jpg` | [gitea.com/troj0/gitbook](https://www.gitea.com/troj0/gitbook/src/branch/master/docs/config.md) |
| GitBook atual | Exporta PDF (página, seção ou espaço); nas docs que li não achei capa ou rodapé editável | [gitbook.com/docs](https://gitbook.com/docs/publish/pdf-export) |
| Confluence (app Content Exporter) | Seções próprias de capa e de cabeçalho/rodapé em perfis de exportação | [docs.meta-inf.hu](https://docs.meta-inf.hu/content-exporter-confluence/user-guides/before-exporting/export-profiles/table-of-contents) |

Padrão: formulário de campos fixos, não edição no próprio documento; número de página com opção de posição; capa sem rodapé. Variáveis em modelo de texto (`_PAGENUM_`) vêm de configuração em arquivo; num formulário, a caixa "Numerar páginas" é mais clara.

Chrome desde a versão 131 aceita conteúdo nas margens da página impressa por CSS (`@page { @bottom-center { content: ... counter(page) } }`, contador `pages` para o total) ([Chrome for Developers](https://developer.chrome.com/blog/print-margins)). O próprio texto diz que o recurso nunca foi bem suportado entre navegadores: precisa de teste no Chrome/Edge da pessoa. Chrome mais antigo deve ignorar a regra e o PDF sai sem número (hipótese a testar).

Diferença possível: o Explicaí já tem público (perfil por export) e o diálogo de exportação; nenhum dos acima liga o texto da capa ao perfil.

## Enquadramento de UX (skill `impeccable:impeccable`, modo Operate)

- Quem e quando: a pessoa que entrega o manual, no fim, abrindo "Exportar" para gerar o arquivo do cliente. Não é uso diário; é revisão final, com medo de erro na frente do cliente.
- Modelo mental: "preencho a ficha do documento" (título, autor, versão, data), como em Word ou Docs. Não "edito uma página de capa". Daí formulário, não edição no lugar.
- Hierarquia: o diálogo já manda: formato, público, aprovadas, depois aparência. Capa e rodapé entram em "Aparência", recolhidos, ao lado de "Cores do manual". Não competem com o botão Exportar.
- Estados: vazio (capa como hoje); preenchido (campos salvam sozinhos, como os de cor); erro (texto longo demais, recusado com o motivo, no estilo de `low-contrast`).
- Primeiro uso: campos vazios com exemplo no placeholder ("Ex.: Versão 2.1, outubro de 2026"), nada obrigatório, sem assistente.
- Erro que dói: mandar ao cliente com autor ou versão errados. A prévia protege disso (opção B).

O que a skill mudou: (1) descartou "editar direto na capa" como corte mínimo, porque o Studio não tem superfície de capa e o modelo mental é de ficha; (2) fixou campos opcionais com placeholder, sem texto livre estruturado; (3) pôs a prévia no centro do risco (entregar errado), não como enfeite. `revisar-design` não foi usada: não há tela construída, e a marca não entra (o Studio fica sóbrio, a cor fica no export).

## O que é editável

| Item | Onde | Decisão | Por quê |
|---|---|---|---|
| Subtítulo | capa | sim | uma linha; "Para: Cliente X" |
| Autor/equipe | capa | sim | |
| Versão | capa | sim, texto livre | "Versão 2.1" sem formato imposto |
| Data | capa | sim, texto livre | data automática torna o export não reproduzível |
| Logo | capa | já existe | |
| Texto livre longo | capa | não | tira do layout; vira página do manual |
| Imagem de fundo | capa | não | quebra o contraste do título (hoje garantido 4,5:1 sobre branco) |
| Texto do rodapé | rodapé | sim, uma linha | "Confidencial", nome do cliente: tudo cabe aqui |
| Número de página | rodapé | sim, caixa (só PDF) | |
| Nome do cliente, data, confidencial | rodapé | sem campo próprio; vão no texto | menos campos, mesmo resultado |
| Variáveis `{pagina}` | rodapé | não agora | a caixa "Numerar páginas" resolve o caso comum |

Proteção da qualidade: tamanho máximo (subtítulo 120, rodapé 100 caracteres), só texto (escapado no HTML; no CSS do PDF, escape de aspas, barra invertida e quebra de linha), tipografia e posição fixas, cor derivada do tema (`--grafite`, já com contraste conferido), sem HTML e sem link.

## Por manual ou por público

Por manual na v1. Por perfil exigiria `cover` por `audience`: mapa a mais no formato e outra seção na tela. Contorno: editar o campo antes de exportar para o perfil. Observar: se ela trocar subtítulo ou rodapé a cada export, vale o override por perfil.

## Formato (risco baixo: aditivo)

Dois campos opcionais no topo do `manual.json`, ao lado de `theme` (texto não é aparência; `theme` é o que vale só para HTML/PDF):

```json
"cover": { "subtitle": "Para: Acme", "author": "Time de Finanças", "version": "Versão 2.1", "date": "outubro de 2026" },
"footer": { "text": "Confidencial · Acme", "pageNumbers": true }
```

- Manual antigo sem os campos exporta igual (mesma regra do `theme`). Não precisa subir `version` do formato.
- HTML: `cover` vira linhas na capa abaixo do título (cor `--grafite`); `footer.text` entra como linha acima do colofão, no fim da tela. `pageNumbers` é ignorado no HTML (página única rolável).
- PDF: `@page` com texto à esquerda e `counter(page) " / " counter(pages)` à direita na margem inferior; `@page :first` sem rodapé (capa). A margem inferior já é 18 mm, cabe 9 pt. Limite: Chrome 131 ou mais novo; o número conta a capa como página 1.
- Colofão do Explicaí segue como está (`hideColophon`). Sem link do Explicaí no rodapé do cliente (discovery da contribuição).
- Markdown: não muda.
- MCP: `create_manual` não define (cria manual vazio). Num passo seguinte, a tool que hoje ajusta o tema ganha `cover`/`footer`, com a mesma validação do core. `export_manual` só lê.
- Atualizar `docs/manual-format.md`.

## Acessibilidade e celular

- Contraste: a cor secundária do tema (derivada do texto, conferida). Sem cor própria no rodapé, a pessoa não consegue quebrar o contraste.
- Tamanho: rodapé de tela 13 px (como o colofão); no PDF 9 pt (mínimo legível impresso). No celular o texto quebra de linha (`overflow-wrap:anywhere`), sem cortar.
- Leitor de tela: linhas da capa em `<p>` dentro do `<header>`; um só `<footer>` por `main`, sem duplicar landmark.
- Studio: rótulos visíveis (não só placeholder); contagem de caracteres perto do limite.

## Opções

| | Ganho | Tamanho | Toca | Riscos | Fora |
|---|---|---|---|---|---|
| A0. Só HTML | subtítulo, autor, versão, data e texto de rodapé no HTML/PDF final; sem número por página | P | A sem CSS de margem | PDF continua sem número por página (queixa óbvia de quem imprime) | prévia, MCP, perfil |
| **A. Ficha de capa e rodapé (recomendada)** | A0 + número de página no PDF; campos no diálogo | M | `types.ts`, validação nova em `core/export` (arquivo próprio), `html.ts`, CSS de impressão, `ExportDialog` + componente novo, `api.ts`, `manual-format.md`, testes | Margin boxes só no Chrome 131+; escape do texto no CSS; `html.ts` já tem 324 linhas (extrair) | prévia, MCP, perfil, imagem de fundo |
| B. A + prévia | miniatura da capa e do rodapé no diálogo antes de exportar | G | A + componente de prévia (CSS do export reaproveitado) | duplicar CSS do export; segunda renderização | MCP, perfil |
| C. B + MCP + override por perfil | automação por agente e capa por cliente | G | B + `explicai-mcp` + formato com mapa por perfil | formato mais complexo | imagem de fundo (só com checagem de contraste) |

Recomendo A: resolve "de quem, qual versão, para quem" e numera o PDF. Observar depois: se a pessoa exporta, abre e volta para corrigir um campo (sinal para B); se troca o texto a cada perfil (sinal para C).

## Decisões da pessoa

1. "Página inicial" é a capa do export? Recomendo sim.
2. Editar onde: formulário "Capa e rodapé" no diálogo de exportação? Recomendo sim; prévia fica para B.
3. Data e versão: texto livre ou automática? Recomendo texto livre (export reproduzível).
4. Rodapé: uma linha livre mais caixa "Numerar páginas" (só PDF)? Recomendo sim; "Confidencial" e nome do cliente vão no texto.
5. Por manual ou por perfil? Recomendo por manual agora.
6. Imagem de fundo e texto longo na capa? Recomendo não (quebra contraste e layout).
7. PDF sem número em Chrome antigo é aceitável (sem erro, com aviso)? Recomendo sim.

## Decisões tomadas (2026-11-04)

A pessoa respondeu: "Edição na capa direta, crie uma etapa pra isso"; "sim prévia"; "texto livre, somente dê a sugestão"; "por manual"; "por enquanto sem imagem de fundo"; e "ok" para PDF sem número em Chrome antigo, com aviso.

Depois ela detalhou: "quando passar o mouse em cima, ter um botão com ícone de edição e abrir a edição da capa em uma modal". O escopo fica na opção B, mais essa etapa. Ver T-147.

## Rascunho de spec da opção A

**Escopo**
- `manual.json` ganha `cover` (`subtitle`, `author`, `version`, `date`: texto, até 120 caracteres) e `footer` (`text` até 100 caracteres, `pageNumbers` boolean), todos opcionais. Funções de merge/validação no core (Studio e, depois, MCP), com os modos do `mergeTheme` (campo ausente fica, `null` apaga).
- HTML: linhas na capa e linha de rodapé no fim. PDF: rodapé nas margens com texto à esquerda e "n / total" à direita, sem rodapé na capa.
- Studio: seção recolhida "Capa e rodapé" no `ExportDialog`; campos que salvam sozinhos, placeholders de exemplo, contador perto do limite, textos pt/en no i18n.
- `docs/manual-format.md` documenta os campos. Markdown não muda.

**Critérios de aceite**
1. Manual sem `cover`/`footer` exporta HTML e PDF idênticos aos de hoje.
2. Com os campos, a capa mostra subtítulo, autor, versão e data nessa ordem; linha vazia não deixa espaço.
3. Texto com `<`, `"`, `'`, `\` e quebra de linha sai literal no HTML e no CSS do PDF, sem quebrar o estilo (teste).
4. PDF: toda página, menos a capa, tem rodapé com texto e "n / total" (teste lendo o PDF; pulado com aviso se o navegador for anterior ao 131).
5. Texto acima do limite é recusado com o motivo; nada é gravado.
6. 375 px e 1280 px: capa sem rolagem horizontal; rodapé quebra linha; contraste da cor secundária >= 4,5:1.
7. Export com `audience` leva os mesmos `cover`/`footer`.
8. `npm run check` passa.

**Riscos**
- Margin boxes dependem do Chrome 131+: detectar a versão ou aceitar a degradação e documentar.
- Texto do usuário dentro de CSS é fonte de injeção: teste obrigatório.
- `html.ts` cresce: extrair capa e rodapé para arquivo próprio em `core/export/`.
- MCP, prévia e perfil ficam como tickets seguintes, só se o uso pedir.

## Lacunas

- Não achei como Scribe e Tango tratam capa e rodapé; sem fonte, não entra.
- Nenhuma entrevista: a dor vem do pedido da pessoa, não de dados de uso.
