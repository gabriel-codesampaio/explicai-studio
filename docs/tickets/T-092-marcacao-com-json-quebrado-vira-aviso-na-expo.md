# T-092: Marcação com JSON quebrado vira aviso na exportação

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 9 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
`assets/tela.png.json` com erro de sintaxe (editado à mão, merge do git, disco cheio) faz `loadImages` lançar. O Studio mostra `Unexpected token...` sem dizer qual arquivo, e nenhum formato sai.

## Critérios de aceite
- [ ] em `loadImages`, `try/catch` por imagem; sem marcações, exporta a imagem pura e acrescenta aviso (`warnings`) com o nome do arquivo. Na rota GET de anotações, devolver 400 com o nome do arquivo.
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
`src/core/assets.ts:126` (`JSON.parse` sem proteção), chamado por `src/core/export/refs.ts:37`.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 9 da auditoria.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
