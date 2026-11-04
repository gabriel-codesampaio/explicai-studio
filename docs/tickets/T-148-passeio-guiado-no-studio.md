# T-148: Passeio guiado no primeiro uso do Studio

- Prioridade: P3
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: [Discovery de tutorial guiado](../discovery/2026-10-30-tutorial-guiado.md), opção B; pedido da pessoa (2026-11-04)

## Problema
O estado vazio já ensina o primeiro print e onde exportar (T-018), mas só quem lê o texto aprende. Quem abre o Studio pela primeira vez não é levado pelo caminho: criar página, colar print, numerar, exportar.

## Critérios de aceite
- [ ] Antes de instalar: o agente `seguranca` avalia o driver.js (MIT, cerca de 5 KB, sem dependências), e um teste em navegador real confere se o foco entra no popover, se o leitor de tela anuncia o título e se `Esc` fecha. Se falhar, usar React Joyride ou parar e registrar.
- [ ] Passeio de 3 a 4 passos: nova página, colar print, numerar, exportar. Aparece uma vez e reabre pelo menu de ajuda.
- [ ] Pular a qualquer momento. "Visto" fica no `localStorage`, nunca no `manual.json`.
- [ ] Elemento-alvo ausente, como menu fechado ou tela estreita, não trava: o passo se ajusta ou é pulado.
- [ ] Textos em pt e en, com o teste de i18n passando. Visual com os tokens do Studio, sem cor nova.
- [ ] Usável só com teclado, com contraste AA nos dois temas e sem animação com `prefers-reduced-motion`.
- [ ] Não abre em e2e nem atrapalha quem já usa o Studio. Formato do manual e export não mudam.

## Onde
`web/src/features/help/`, `web/src/App.tsx`, `web/src/lib/i18n*.ts`.

## Como verificar
E2e do primeiro uso, de pular e de reabrir. Print em 375 e 1280, teclado e leitor de tela.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
