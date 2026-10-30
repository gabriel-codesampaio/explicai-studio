# Discovery: voz configurável do manual (2026-10-30)

Ideia do caderno (28/10): "O MCP precisa ter um tipo de voz configurável: mais profissional ou mais tranquila." O módulo 5 da entrevista de marca já a fechou: Profissional (padrão), Tranquilo e Personalizado, "configurável no app e no MCP" (`brand/discovery/modules/50_voice-tone.md`). O que falta é decidir onde a escolha mora e como ela chega ao texto.

## Problema
Quem monta manuais com a IA (dev ou software house) quer que o texto de todas as páginas soe igual e combine com o público do cliente. Hoje o MCP não existe em código (ver abaixo), então não há tom nenhum. Sem a escolha salva, cada sessão da IA decide por conta própria e o manual sai com vozes misturadas. Hipótese: nenhum usuário real pediu isso ainda (PRODUCT.md, "Evidence on Hand"); a ideia vem da entrevista de marca.

## O que já existe
- **`explicai-mcp` está vazio.** Tem `README.md` com só o título, `LICENSE` e um commit inicial. Não há prompts, ferramentas nem código de geração. Tudo aqui é desenho, não mudança.
- **Quem escreve o texto é a IA do cliente, não o MCP.** O MCP só expõe ferramentas (criar página, inserir imagem...). O tom, na prática, é uma instrução que chega ao modelo: parâmetro da ferramenta, prompt do MCP ou campo salvo que a IA lê. Nenhum código nosso "gera" frase.
- **Spec e produto já prometem o parâmetro:** `docs/spec-v1.md:46` e `PRODUCT.md:46`.
- **`manual.json` não tem campo de voz.** `ManualMeta` tem `title`, `language`, `theme?` e `pages` (`src/core/types.ts:15-23`). `readManual` devolve o JSON como veio, então campo opcional novo não pede `FORMAT_VERSION` 2 (`src/core/manuals.ts:42-54`).
- **Armadilha conhecida:** `setManualTheme` apaga `theme` inteiro quando falta `accent` (`src/core/export/index.ts:71-77`). Um campo de voz deve ficar fora de `theme` e ter função própria.
- **Studio não tem IA.** Tem `AppearancePanel` e `ShortcutsDialog` no rodapé da barra lateral (`web/src/layout/Sidebar.tsx:106-109`) e sem tela de configuração do manual. "No app" só pode significar ver e trocar o tom salvo.
- O manual tem idioma em `language` e o exemplo dos dois tons está só em pt-BR. Em inglês, "Clica" não existe; o tranquilo precisa de outro exemplo.

## Concorrentes
Busquei controle de tom nos textos dos passos de Scribe, Tango e Guidde e **não encontrei documentação** de tal recurso. Não afirmo que não exista; é lacuna da minha busca. O que achei de útil, sobre assistentes de IA em geral:

- Descrição vaga ("amigável", "profissional") dá pouca instrução ao modelo; frase concreta funciona melhor ([Frase](https://help.frase.io/tone-of-voice), [Act-On](https://connect.act-on.com/hc/en-us/articles/38976552703511)).
- Tom muda o estilo, não os fatos (Act-On, mesma fonte).

Leitura para nós: cada tom precisa de um exemplo do mesmo passo, como já está no módulo 5. O Personalizado deve pedir uma frase com público e registro, não um adjetivo.

## Onde a escolha fica salva
| Lugar | Prós | Contras |
|---|---|---|
| **`manual.json` → `voice`** | Vale por manual; vai no git; o Studio e o MCP leem o mesmo; sessões novas da IA herdam | Campo novo no formato (opcional, baixo risco) |
| Config do MCP (arquivo ou argumento) | Nada muda no formato | Vale para todos os manuais; o Studio não vê; cliente com tom diferente exige trocar à mão |
| Só parâmetro da ferramenta | Zero armazenamento | A IA esquece entre sessões; voz inconsistente, que é o problema |

Recomendo `manual.json`, com o parâmetro da ferramenta como sobrescrita pontual.

Forma proposta:
```json
"voice": { "tone": "tranquilo" }
"voice": { "tone": "personalizado", "custom": "como se explicasse para quem nunca usou computador" }
```
Sem `voice`, vale Profissional.

## Opções
| # | Ganho | Tam. | Riscos | Fora |
|---|---|---|---|---|
| **A** | Campo `voice` no formato, com leitura e gravação validadas no core, e a tabela dos tons (com exemplo por idioma) em `docs/manual-format.md`. O MCP, quando existir, lê o campo | P | Escolher o nome do campo agora, antes de o MCP existir | Interface no Studio; tela de edição; reescrever texto pronto |
| B | A + seletor de tom no Studio (e campo de texto no Personalizado) | M | Tela nova numa ferramenta sóbria; sem IA no Studio, o tom só vale para o MCP | Reescrita de páginas existentes |
| C | B + ferramenta do MCP que reescreve um manual inteiro em outro tom | G | Depende do MCP pronto; reescrever pode mudar fato ou apagar edição manual; custo de tokens | — |

**Recomendação: A.** O MCP ainda não existe, e o ganho real do tom é a IA ler a mesma escolha em toda sessão. O Studio não gera texto, então um seletor nele (B) só tem sentido quando houver MCP usando. Observar: a pessoa edita o tom à mão no `manual.json`? Se sim, B vale. Se pedirem para converter um manual pronto, aí C.

## Riscos
- **Formato:** campo opcional, sem versão nova. Documentar em `docs/manual-format.md` e em `.claude/rules/manual-format.md`.
- **Validação no core:** o MCP também grava. Tom fora da lista, ou `custom` vazio com tom personalizado, é recusado com mensagem que diz o que fazer.
- **Personalizado vira instrução na IA.** Texto livre salvo no manual e lido por um modelo é entrada não confiável: o MCP deve tratá-lo como estilo, nunca como comando. Limitar o tamanho (ex.: 280 caracteres).
- **Regra da marca:** nunca humor em passo de manual (módulo 5, regra 4). Nenhum tom, nem o Personalizado, pode pedir piada ou gíria que quebre isso; o prompt do MCP repete a regra.
- **Idioma:** exemplos dos tons por idioma (pt-BR e en-US), senão o Tranquilo em inglês sai estranho.
- **Marca:** o Studio fica sóbrio. O tom do manual é conteúdo, não decoração.

## Decisões suas (com recomendação)
1. Onde salvar? → `manual.json`, campo `voice`.
2. Profissional é mesmo o padrão? (a pergunta está aberta no módulo 5) → Sim.
3. Personalizado: texto livre com limite? → Sim, 280 caracteres.
4. Entra seletor no Studio agora? → Não; só quando o MCP existir e usar o campo.
5. Reescrever manual pronto em outro tom? → Fora por ora.
6. Em en-US, qual é o Tranquilo? → Contração e "you" direto ("Click **New client** and the form opens."). Precisa da sua aprovação do exemplo.

## Rascunho de spec (opção A)
- **Escopo:** tipo `ManualVoice` (`tone: "profissional" | "tranquilo" | "personalizado"`, `custom?: string`) em `src/core/types.ts`; `voice?` em `ManualMeta`. Função `setManualVoice(dir, voice)` no core, separada de `setManualTheme`, que valida e grava via `updateManual`. Seção "Voz" em `docs/manual-format.md` com os três tons e um exemplo por idioma. Sem rota HTTP nem tela ainda.
- **Critérios de aceite:**
  - Manual sem `voice` lê e grava como hoje, sem diferença no `manual.json`.
  - `setManualVoice` com tom válido grava e relê igual; os outros campos (`theme`, `pages`) ficam intactos.
  - Tom desconhecido, ou Personalizado sem `custom`, ou `custom` acima de 280 caracteres, é recusado com mensagem que diz o limite.
  - Gravar `theme` não apaga `voice`, e o contrário também.
  - Teste de ida e volta no core cobre os quatro casos acima.
  - Exportação (HTML, PDF, Markdown) não muda.
- **Riscos:** nome do campo congelado antes do MCP; `custom` como instrução injetada; esquecer o `.claude/rules/manual-format.md`.

Não verificado: se Scribe, Tango ou Guidde têm controle de tom (a busca não achou). O `explicai-mcp` está vazio, então o desenho de ferramentas e prompts ainda não foi decidido.

## Decisões tomadas (2026-10-30)
- A voz é só do MCP: nada no Studio. Ticket quando o `explicai-mcp` tiver código.
- Pendente: onde o tom fica salvo e o exemplo do tom Tranquilo em inglês.
