# T-064: QA completo da feature de imagem do editor

- Prioridade: P2
- Tamanho: G
- Status: em andamento
- Agente: qa
- Origem: pedido da pessoa em 2026-10-30

## Problema
A feature de imagem tem muita superfície e testes espalhados. Falta um mapa do que está coberto e testes do que não está.

## Critérios de aceite
- [ ] Mapa de casos (já tem teste / falta) no registro do ticket.
- [ ] Entrada: botão Imagem, Ctrl+V (várias imagens, imagem com texto), arrastar e soltar, tipos aceitos e recusados (svg, gif, webp, heic, não imagem), imagem grande, nome com acento e espaço, mesma imagem duas vezes.
- [ ] Edição: alt, legenda, Enter depois da imagem (T-022), dentro de passo, apagar/desfazer/refazer, mover, copiar e colar entre páginas.
- [ ] Marcações: criar, editar, mover, apagar destaque, seta, número e área clicável; desfazer; legenda.
- [ ] Persistência: recarregar, versão e restaurar, lixeira, renomear página, imagem sem uso.
- [ ] Exportação HTML, PDF e Markdown com imagem e marcações; imagem faltando gera aviso.
- [ ] Tela: 375 e 1280 px, claro e escuro, teclado e leitor de tela.
- [ ] Robustez: falha de rede no upload (route.abort), erro do servidor, upload lento, duas abas.
- [ ] Testes em arquivo e2e próprio da área de imagem (e2e/studio.imagem.e2e.ts); cada bug achado vira ticket separado.

## Onde
`e2e/studio.imagem.e2e.ts` (novo), `test/`, `web/test/`. O popover colado no rodapé é o T-063; a seta e a legenda são do T-012.

## Como verificar
Teste primeiro (unit ou e2e da área); medir no navegador, claro e escuro, 1280 e 375 px.

## Registro
Testes: `e2e/studio.imagem.e2e.ts` (34 passam, 2 em `test.fixme`) e `test/image-assets.test.ts`. Roda com `E2E_PORT=4493 npx playwright test e2e/studio.imagem.e2e.ts`.

### Mapa de casos
| Critério | Caso | Teste |
|---|---|---|
| Entrada | botão Imagem, várias de uma vez | imagem.e2e (entrada) |
| | Ctrl+V três imagens; imagem com texto | imagem.e2e |
| | arrastar e soltar no ponto | imagem.e2e |
| | gif, webp aceitos; svg, heic, txt recusados ao colar | imagem.e2e |
| | tipos do seletor (`accept`); não imagem pelo seletor (aviso) | imagem.e2e |
| | tipos aceitos/recusados no núcleo (png, jpg, gif, webp, svg; heic, txt, exe, sem extensão) | test/image-assets |
| | 15 MB entra, 21 MB recusado | imagem.e2e; limite de 20 MB já em test/server |
| | nome com acento e espaço; mesma imagem duas vezes | imagem.e2e + test/image-assets |
| Edição | alt vai ao Markdown e volta; legenda na página | imagem.e2e (+ studio.e2e) |
| | Enter depois da imagem | imagem.e2e; web/test/enterAfterImage |
| | Ctrl+End depois da imagem | `test.fixme` (T-070) |
| | dentro de passo; apagar/desfazer/refazer; mover; copiar entre páginas | imagem.e2e |
| Marcações | marcador, destaque, seta, área clicável; apagar (lista e Delete); Desfazer; Cancelar; só Salvar grava | imagem.e2e |
| | mover destaque + Desfazer; matemática das marcações | studio.e2e; web/test/annotations |
| | legenda após recarregar | imagem.e2e |
| Persistência | recarregar, versão e restaurar, lixeira e restaurar, renomear página, imagem sem uso e limpeza | imagem.e2e; test/unused-assets, versions, trash |
| Exportação | HTML e Markdown com imagem e marcações, PDF (%PDF) | imagem.e2e + test/image-assets |
| | imagem faltando: aviso no resultado e no diálogo | test/image-assets + imagem.e2e |
| Tela | 375 e 1280 px, claro e escuro: sem rolagem lateral, imagem cabe, axe sem grave/crítico | imagem.e2e (4 testes) |
| | teclado: Tab do campo até Marcar imagem; Esc devolve o foco | `test.fixme` (T-071) |
| Robustez | route.abort, erro 500, envio lento, duas abas, envio simultâneo | imagem.e2e + test/image-assets |

### Bugs achados
- Imagens coladas ou escolhidas de uma vez entravam na ordem inversa: corrigido (1fc6f5e).
- Exportação não avisava imagem inexistente: corrigido (f3bfd8a), aviso aparece no diálogo.
- Dois envios simultâneos do mesmo nome davam EEXIST (500): corrigido.
- T-070: Ctrl+End às vezes deixa o cursor antes da imagem (cerca de 1 em 5). Aberto.
- T-071: Esc no balão da descrição joga o foco para o body. Aberto.

### Observações (sem ticket)
- svg: o servidor e o núcleo aceitam, mas colar, soltar e o seletor recusam (`IMAGE_TYPES` sem svg). Decidir se svg entra.
- Depois do Enter no campo da descrição a imagem continua selecionada; digitar logo em seguida a substitui.

### Pendente (ticket continua em andamento)
- Leitor de tela de verdade (só axe e papéis ARIA conferidos).
- Área clicável no HTML exportado (clique leva à página), HTML/PDF no escuro.
- Fluxos de versão e lixeira pela interface com imagem (cobertos pela API).
- Um print de cada tela (medição foi por script).
