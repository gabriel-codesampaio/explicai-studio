# T-064: QA completo da feature de imagem do editor

- Prioridade: P2
- Tamanho: G
- Status: aberto
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
- [ ] Testes em arquivo e2e próprio da área de imagem (e2e/imagem.e2e.ts); cada bug achado vira ticket separado.

## Onde
`e2e/imagem.e2e.ts` (novo), `test/`, `web/test/`. O popover colado no rodapé é o T-063; a seta e a legenda são do T-012.

## Como verificar
Teste primeiro (unit ou e2e da área); medir no navegador, claro e escuro, 1280 e 375 px.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
