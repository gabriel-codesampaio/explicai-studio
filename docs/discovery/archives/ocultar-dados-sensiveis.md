# Discovery: ocultar dados sensíveis nos prints

Data: 2026-11-03. Continua a opção C de `marcacao-de-imagem.md`, que deixou esta ferramenta para um discovery próprio porque ela mexe na regra de que "o print vem de fora". Sem código nem ticket.

## Resumo

Ferramenta **Ocultar**: a pessoa arrasta retângulos sobre o print, confere e clica em **Aplicar**. O Studio desenha **tarja sólida opaca** nos pixels (canvas, no navegador), grava o PNG novo **no mesmo caminho** (arquivo reescrito inteiro) e o original some do disco. Sem formato novo no JSON, sem dependência nova, sem mudança no export. Detecção automática fica para depois.

## O que existe hoje (lido no código)

- Marcações são JSON ao lado da imagem (`assets/x.png.json`), coordenadas de 0 a 1, tipos `markers`, `highlights`, `arrows`, `hotspots`. `parseAnnotations` valida (`src/core/annotations.ts`).
- Ferramentas do editor: `select V`, `marker M`, `highlight D`, `arrow S`, `hotspot A` (`web/src/lib/toolShortcuts.ts`). **`O` está livre.**
- O Desfazer (Ctrl+Z) do editor guarda os 50 últimos rascunhos em memória; só vale até salvar.
- `saveAsset` grava em `assets/` com nome único; `cleanUnusedAssets` **move** imagens sem uso para uma pasta dentro do manual (não apaga). `.versoes/` guarda só o Markdown das páginas, não imagens.
- Dependências do pacote: só `marked` e `yaml`. Não há decodificador de imagem no Node. `imageSize` lê só o cabeçalho.
- O export copia as imagens para `exportacao/html/assets/` e o PDF sai desse HTML.

## 1. Forma de ocultar

| Forma | Seguro para segredo? | Nota |
|---|---|---|
| Tarja sólida 100% opaca | **Sim** | Sem informação restante nos pixels cobertos. Os pesquisadores que publicaram ferramentas de reversão (Unredacter, Bishop Fox) recomendam só tarja preta ([ITPro](https://www.itpro.com/security/362302/only-use-black-bars-to-redact-text-warns-researcher)). |
| Pixelização | Não | Depix e Unredacter reconstroem texto pixelado com filtro de caixa e fonte conhecida ([JUMPSEC](https://labs.jumpsec.com/?p=18253), [Daily Swig](https://portswigger.net/daily-swig/new-tool-can-uncover-redacted-pixelated-text-to-reveal-sensitive-data)). Print de interface tem fonte conhecida: o pior caso. |
| Borrão gaussiano | Não (hipótese) | Deconvolução de borrão leve é reversível em teoria; não achei fonte nesta rodada. "Secure blur" do CleanShot randomiza o padrão (4.1+), mas não garante nada. |

**Padrão: tarja sólida**, cor única (cinza-escuro do tema, sem transparência). Borrão e pixelização ficam fora do corte mínimo; se entrarem um dia, com o aviso "só estético, não protege". Regras de implementação: cobrir a caixa inteira do texto com folga de uns 4 px; alpha 1; sem bordas suaves.

## 2. Destrutivo ou sobreposto

| | Queimar nos pixels | Sobreposição (JSON) |
|---|---|---|
| Original com o dado | Some do disco | **Continua em `assets/`, em `exportacao/html/assets/`, no git e na lixeira de imagens sem uso** |
| Segurança | Boa | Ruim: "ocultar" é só visual, quem abre o PNG vê tudo |
| Formato | Nenhum novo | `redactions[]` novo, regra de qual arquivo vale, testes de lixeira e de imagem sem uso mudam |
| Desfazer | Só antes de aplicar | Sempre (e é por isso que vaza) |

**Recomendação: queimar, sem camada.** Sobreposição só serve se a camada não sair do Studio, e o export teria de queimar do mesmo jeito, então o vazamento no disco continua. Descartada.

Como queimar sem vazar:

1. Rascunho: retângulos vivem só na memória do editor, com o Desfazer que já existe (nada em disco).
2. **Aplicar**: confirmação em linguagem direta ("Isto troca o print por uma versão com as áreas cobertas. O original será apagado e não dá para voltar."). Desenha a imagem num canvas, pinta as tarjas, `toBlob("image/png")`.
3. Grava com arquivo **novo completo** (temp + rename sobre o mesmo caminho). Nunca editar bytes in place: é o gatilho do aCropalypse, em que sobravam bytes depois do `IEND` do PNG e o recorte original era reconstruído ([BleepingComputer](https://www.bleepingcomputer.com/news/microsoft/windows-11-snipping-tool-privacy-bug-exposes-cropped-image-content/)). `toBlob` recodifica só pixels: sai sem EXIF/XMP/camadas (fontes são posts de blog, hipótese razoável; testar nos navegadores).
4. **Mesmo caminho e mesmo tamanho**: referências no Markdown e as marcações (0 a 1) continuam valendo. Só funciona para PNG/JPEG/WebP/GIF raster; SVG e GIF animado: recusar com mensagem (SVG tem texto; GIF perderia os quadros).
5. Original apagado de verdade (`rm`), **não** vai para a lixeira.

Riscos que sobram (precisam de aviso, não de código):

- **Git**: se a pasta do manual está em repositório, o commit antigo guarda o original. Apagar do disco não limpa histórico. Aviso na confirmação; limpar histórico é decisão da pessoa.
- **Exports antigos**: `exportacao/` anterior tem o original. Avisar "exporte de novo e apague os arquivos antigos" (ou apagar a cópia correspondente em `exportacao/html/assets/` quando existir; decidir na spec).
- **Cache do navegador** e cópias que a pessoa já enviou: fora do controle.
- **Perfil de cor**: o PNG recodificado perde ICC; cor pode mudar levemente. Aceitável.
- **Tarja errada ou curta**: o risco humano maior. Mitigação: pré-visualização do resultado antes de Aplicar (as tarjas já aparecem opacas no rascunho).
- Marcações já desenhadas (setas, destaques) ficam como estão, em JSON por cima: não contêm pixel do print.

## 3. Interação no editor

- Ferramenta **Ocultar** na barra, atalho **`O`**, ícone `EyeOff` ou `RectangleHorizontal` do lucide, dica "Arraste sobre o dado que deve sumir".
- Arrasta retângulo: aparece tarja opaca com borda tracejada fina (só no rascunho) e alça de redimensionar, como o destaque.
- **Fora da numeração** e fora da lista de marcações: não são marcadores nem entram na legenda. Mostrar uma linha separada na lista, "N áreas a ocultar", com botão **Aplicar ocultação** e **Descartar**. Depois de aplicar, nada fica listado (já virou pixel).
- Botão Aplicar fica desabilitado sem retângulos. Sair do editor com rascunho de ocultação pergunta antes (perder a ocultação é perda silenciosa de proteção).
- Esboço de design: não precisa nesta fase; reaproveita a mecânica do destaque.

## 4. Detecção automática

Vale **depois**, e como sugestão que a pessoa confirma.

- Regex sobre texto: e-mail; CPF com validação dos dígitos; cartão 13 a 19 dígitos com Luhn; token por prefixo (`sk-`, `ghp_`, `AKIA`, `eyJ`) ou string longa de alta entropia. OCR confunde 0/O e 1/l: tolerar na regex, preferir cobrir a mais, sempre confirmar.
- Fonte do texto: se a captura vier do navegador (MCP `capture_walkthrough`), o texto do DOM e as caixas (`getBoundingClientRect`) já existem: **zero OCR**, mais preciso. OCR só para PNG avulso colado.
- OCR local: `tesseract.js` ou `tesseract-wasm` ([npm](https://www.npmjs.com/package/tesseract-wasm), ~3,9 MB sem o modelo) mais dados de idioma de ~3 MB. Peso de alguns MB, carregar sob demanda, precisão em interface escura/pequena **não medida** (a pesquisa só achou números de blogs). Contra "local e leve": o pacote hoje tem 2 dependências; OCR seria a maior de longe.
- Concorrentes cobram por isso: Snagit Smart Redact (OCR), Scribe Smart Blur (plano Pro), Tango Secure Blur (Business). Nenhum garante achar tudo, e o mercado trata como ajuda.
- Conclusão: não entra no corte mínimo. Se a dor for "esqueci um e-mail no canto", uma fatia posterior com regex sobre texto do DOM resolve a maioria sem OCR.

## 5. Export e MCP

- **HTML, PDF, Markdown**: nada muda. A imagem já chega com as tarjas; o Markdown aponta para o mesmo caminho. Conferir que o PNG novo é o que vai para `exportacao/` (sem cópia velha).
- **MCP** (`mcp.md`): `annotate_image` **não** deve ganhar ocultar. Ela escreve JSON de sobreposição, e ocultar por camada é o vazamento descartado acima. Ocultar pixel no Node exige decodificar e codificar PNG, o que o core não faz hoje (só `zlib`; sem lib de imagem). Opções quando chegar a hora: `pngjs` (pequena, JS puro; hipótese, não verifiquei versão nem manutenção) numa função `redactImage(dir, asset, rects)` do core, exposta como tool `redact_image`. Antes disso, regra para o agente em `capture_walkthrough`: não capture telas com dado real; use dados de exemplo.
- Garantir que o MCP nunca devolva ao agente o original depois de ocultado (o arquivo não existe mais).

## 6. Referências

| Ferramenta | O que faz | Aplicável |
|---|---|---|
| [Snagit](https://www.techsmith.com/learn/tutorials/snagit/hide-sensitive-information) | Blur, pixelate, sólido; Smart Redact por OCR | Detecção sugerida + manual |
| [CleanShot X](https://9to5mac.com/2022/01/31/cleanshot-x-utility-for-mac-adds-new-quick-controls-blur-options-more/) | Blur, pixelate, secure blur manuais | Manual por arraste; se queima nos pixels: não confirmei |
| [Shottr](https://www.bitdoze.com/shottr-mac-screenshot-tool/) | Blur e pixelate manuais; OCR só para copiar texto | Idem |
| [Scribe](https://scribe.com/library/smart-blur) | Smart Blur (e-mail, números, nomes) antes da captura, Pro, extensão | Borrar antes de existir o pixel é o melhor modelo; no Studio o print vem de fora, então vale só para captura via MCP |
| [Tango](https://help.tango.us/en/articles/7225709-how-to-use-secure-blur) | Batch Blur em até 100 prints, Live e Secure Blur por plano | "Mesma área em vários prints" é boa ideia futura |

Planos e formas padrão desses produtos divergem entre páginas: tratar como hipótese. Nenhum dos cinco, pelo que achei, usa tarja como padrão; todos oferecem borrão, que a pesquisa de segurança desaconselha para segredo.

## 7. Opções

| Opção | Conteúdo | Esforço | Risco |
|---|---|---|---|
| **1. Corte mínimo (recomendado)** | Ferramenta Ocultar, tarja sólida, Aplicar destrutivo no mesmo caminho, aviso de git e export | **M** | Pessoa esquece de aplicar; histórico git; tarja curta |
| 2. Mais borrão/pixelate | 1 + estilos "estéticos" com aviso | M | Falsa segurança; não recomendo |
| 3. Detecção por regex no DOM/texto | 1 + sugestões vindas da captura do MCP | M a G (depende do MCP) | Falso negativo passa sensação de segurança |
| 4. OCR local | 1 + tesseract sob demanda | G | Peso, precisão não medida, 1ª dependência grande |
| 5. Sobreposição | `redactions[]` no JSON | G | Vaza o original; **descartada** |

## 8. Corte mínimo pronto para spec

**Escopo.** Ferramenta Ocultar (`O`) no editor de marcação; rascunho em memória; Aplicar queima tarjas sólidas no PNG/JPEG/WebP e substitui o arquivo no mesmo caminho; apaga o original.

**Critérios de aceite.**
1. Arrastar com `O` cria retângulos opacos redimensionáveis, fora da numeração e da legenda; Desfazer funciona.
2. Aplicar mostra confirmação com o texto de irreversível e o aviso de git/exports; cancelar não muda nada.
3. Após aplicar, todo pixel dentro dos retângulos é a cor da tarja (teste que lê os pixels do PNG gravado); pixels fora ficam iguais.
4. O arquivo gravado não tem bytes depois do `IEND`, não tem EXIF e foi escrito por temp + rename; o tamanho em pixels não muda.
5. Referências no Markdown e marcações JSON continuam válidas sem edição.
6. O original não existe mais em `assets/` nem na pasta de imagens sem uso; export novo contém só a versão tarjada.
7. SVG e GIF animado: botão recusa com mensagem clara.
8. Sair com rascunho pergunta antes; textos em pt-BR e en.
9. Item novo na lista de Atalhos (`TOOL_KEYS`) e teste de `toolForKey("O")`.

**Fora do corte.** Borrão/pixelate, detecção automática, OCR, MCP `redact_image`, ocultar em lote, limpar histórico git, apagar exports antigos (só aviso).

**Verificação sugerida.** Teste de unidade da função que pinta (pura, no web, sobre `ImageData`); e2e: arrastar, aplicar, reabrir o arquivo e medir pixels; conferir que `assets/` não tem cópia.

## 9. Perguntas abertas

1. O original deve ser apagado sempre, ou oferecer "guardar uma cópia fora do manual"? Recomendo apagar, sem opção, no corte mínimo.
2. Apagar também a cópia velha em `exportacao/html/assets/` ao aplicar, ou só avisar? Recomendo avisar.
3. Cor da tarja: uma só (preto ou cinza do tema) ou escolha? Recomendo uma só.
4. Vale um aviso permanente se a pasta do manual estiver num repositório git?
5. Medir tesseract em 5 prints reais do Studio antes de decidir a opção 4.

## Não verificado

Se CleanShot e Shottr queimam nos pixels; planos atuais de Scribe e Tango; reversão de borrão gaussiano (sem fonte); `toBlob` sem metadados em todos os navegadores; peso e precisão reais de OCR em interface; versão e manutenção do `pngjs`; se o Win10 Snip & Sketch ainda tem o aCropalypse.

**Decidido em 2026-11-03:** a pessoa aceitou as recomendações 1 a 4 (apagar sempre o original, só avisar sobre os exports, uma cor de tarja, aviso fixo quando houver git). A 5 fica para depois. Virou o ticket T-116.
