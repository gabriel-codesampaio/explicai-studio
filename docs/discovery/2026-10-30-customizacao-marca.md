# Discovery: customização de fontes, cores etc. (2026-10-30)

Complementado por [cor na seleção e estilos do manual](2026-10-30-cor-na-selecao.md).

Ideia do caderno: "Adicionar customização das fontes, cores, etc."

## Problema
Quem entrega o manual a um cliente (software house, dev) quer o HTML e o PDF com a marca do cliente: logo, cor, nome. Hoje dá para escolher 1 de 4 cores, e a capa só tem o título. Hipótese: ainda não há usuário real que confirme (PRODUCT.md, "Evidence on Hand").

## Duas leituras
- **Manual exportado (recomendada).** Combina com a marca: a cor e a personalidade ficam no manual exportado.
- **Studio.** Já tem claro/escuro e idioma. O T-019 tirou as cores do Studio por decisão sua. Descartada.

## O que já existe
- `manual.json` → `theme: { accent }` (`src/core/types.ts:21-28`, `docs/manual-format.md:34`).
- `setManualTheme` (`src/core/export/index.ts:71`) só aceita hex de 6 dígitos. Chamada sem `accent` apaga o `theme` inteiro: campo novo sumiria junto.
- Rota `PUT /api/manuals/:slug/theme` (`src/server/routes/export.ts:22`).
- `--accent` entra no CSS do export (`src/core/export/html.ts:17,155`); número do passo é branco sobre `--accent` (`html.ts:188`).
- Fontes da marca: OFL, ~120 KB, copiadas por `copyFonts`.
- `docs/spec-v1.md` lista **"temas por cliente" como fora da v1**.
- Formato: `readManual` preserva campos desconhecidos; campo opcional novo em `theme` não exige `FORMAT_VERSION` 2. O `explicai-mcp` não lê `theme`.

## Concorrentes
| Produto | O que deixa personalizar | Fonte |
|---|---|---|
| Scribe | Logo e cor por guia no Pro; padrão da organização só no Enterprise | [ajuda](https://scribehow.com/o/Muqncyf1TO6VguRjURC1Mw/viewer/Add_a_custom_logo_to_your_Scribe_documents__zuHbcIVXSmyrsN8hiwXSBA), [anúncio](https://scribe.launchnotes.io/announcements/ann_YhmkAeFdoX18q) |
| Tango | Logo no PDF e embed, cor em hex, tira "Created with Tango". Só Pro/Enterprise | [marca](https://help.tango.us/en/articles/5971709-can-i-add-my-own-branding-to-tango-workflows), [logo no PDF](https://help.tango.us/en/articles/6155778-how-do-i-add-my-logo-to-pdf-downloads) |
| GitBook | Cor grátis; logo e fonte da lista pagos; fonte própria só no Ultimate | [docs](https://gitbook.com/docs/docs-site/customization/icons-colors-and-themes) |
| Confluence | Look and feel por espaço; PDF com CSS livre e logo na capa (admin) | [docs](https://confluence.atlassian.com/doc/customize-exports-to-pdf-190480945.html) |
| Mintlify | Cor primária obrigatória; fonte Google ou woff local | [docs](https://www.mintlify.com/docs/organize/settings-appearance) |
| Notion | 3 fontes fixas; quem quer mais usa Super/Simple.ink | [simple.ink](https://www.simple.ink/guides/notion-custom-fonts), [TechCrunch](https://techcrunch.com/2024/06/25/notion-sites/) |

Padrão: logo + cor + tirar a marca da ferramenta é pago em todos. Fonte própria é o topo da tabela de preço. Onde ser diferente: logo e cor de graça, e recusar cor sem contraste.

## Opções
| # | Ganho | Tam. | Riscos | Fora |
|---|---|---|---|---|
| **A** | Logo do cliente na capa e no topo do sumário (HTML/PDF) + cor livre em hex com checagem de contraste | P/M | Contraste; tamanho/formato do logo; `setManualTheme` apagando campos | Fontes, capa custom, remover rodapé |
| B | A + 3–4 pares de fontes OFL empacotados | M | Pacote npm +100–200 KB por par | Fonte própria |
| C | B + upload de fonte própria + capa e rodapé editáveis | G | Licença de fonte comercial, arquivos grandes, glifos | — |

**Recomendação: A.** Resolve a entrega ao cliente, é o que os concorrentes cobram e não mexe na fonte (Atkinson é escolha de acessibilidade). Depois, observar se aparecem pedidos de fonte antes de pensar em B.

## Riscos
- **Cor livre:** link e número do passo (branco sobre a cor) pedem contraste ≥ 4,5:1 com `#fff`; uma checagem cobre os dois. Validar no core, porque o MCP também grava.
- **Logo:** copiar para `assets/`, PNG/JPG/SVG até 1 MB; SVG só via `<img>` ou sanitizado.
- **PDF:** logo na capa (`html.ts:209`) sem estourar a página.

## Decisões suas (com recomendação)
1. "Temas por cliente" sai do "fora da v1"? → Sim, só a opção A.
2. Cor sem contraste: recusar ou avisar? → Recusar (WCAG AA está no PRODUCT.md).
3. As 4 cores prontas ficam como atalho ao lado do campo hex? → Sim.
4. Remover o rodapé "Explicaí"? → Manter por ora.
5. Fonte entra agora? → Não; esperar pedido real.

## Rascunho de spec (opção A)
- **Escopo:** `theme.logo` (caminho em `assets/`) e `theme.accent` com qualquer hex. Logo na capa e no topo do sumário do HTML e do PDF. Campo hex + 4 atalhos no ExportDialog. Upload de logo. Atualizar `docs/manual-format.md`. Sem `FORMAT_VERSION` novo.
- **Critérios de aceite:**
  - Hex com contraste ≥ 4,5:1 com branco é salvo e aparece em links e números.
  - Cor abaixo disso é recusada pelo core e pela UI, com o contraste atual e o mínimo na mensagem.
  - Logo PNG/JPG/SVG até 1 MB aparece na capa do HTML e do PDF e abre offline.
  - Remover o logo ou voltar à cor da marca não apaga o outro campo.
  - Manual antigo sem `theme` exporta igual a hoje.
  - O Markdown exportado não muda.
- **Riscos:** SVG com script; logo grande quebrando a capa do PDF; MCP gravando cor sem validação.

Não verificado: preços atuais dos concorrentes (fontes divergem).

## Decisões tomadas (2026-10-30)
- Logo do cliente: sim. → [T-032](../tickets/T-032-logo-do-cliente.md)
- Rodapé do Explicaí: fica por padrão, com opção de exportar sem ele. → [T-033](../tickets/T-033-exportar-sem-rodape.md)
