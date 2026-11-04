# T-112: e2e "barra da seleção" falha às vezes

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: qa
- Origem: preparação da versão de produção (2026-11-03)

## Problema
O e2e falha no CI quase toda vez (seleção e teclado: studio.e2e.ts:187 e :779, studio.texto.e2e.ts:87, :200 e :211; inglês em studio.e2e.ts:386). Local passa. Suíte instável não serve de porta para a versão.

## Critérios de aceite
- [x] Causa medida (skill diagnosticar), corrigida no teste ou no código; 10 repetições seguidas verdes, também em paralelo.
- [x] Teste cobrindo o caso; `npm run check`.

## Onde
e2e/studio.e2e.ts:187

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`.

## Registro
Causa (medida no CI, sonda com 12 repetições): o ProseMirror só lê a seleção do navegador no selectionchange, depois do evento de teclado. Com a CPU disputada do runner, um Shift+Home logo após digitar era desfeito por uma transação ainda com o cursor antigo (DOM voltava de [17,0] para [17,17]), e Ctrl+E, Ctrl+K e a barra da seleção agiam na seleção velha. Em "sem seleção: o link", o Enter do diálogo devolve o foco depois, e o "a" digitado antes se perdia. Em "interface em inglês", o GET da lista corria antes do POST do manual novo.

Correção só nos testes: `e2e/editor-sync.ts` (`settleEditor` espera o ProseMirror igualar a seleção do DOM) depois de digitar, clicar e mover a seleção; espera o foco do editor após o diálogo; poll na lista de manuais.

Prova: antes, 23 falhas em 50 execuções dos mesmos testes no CI; depois, 120 de 120 e a suíte completa (142) verde em 2 jobs, em 3 rodadas seguidas. O teste da imagem pelo teclado (studio.imagem.e2e.ts:266) tinha a mesma corrida e recebeu a mesma espera. O PDF de 30 s (studio.imagem.e2e.ts:559) não repetiu em 10 execuções; sem causa própria medida, provável efeito de CPU disputada.
