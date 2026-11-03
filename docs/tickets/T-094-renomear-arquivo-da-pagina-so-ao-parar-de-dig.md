# T-094: Renomear arquivo da página só ao parar de digitar o título

- Prioridade: P2
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: auditoria ponytail de 2026-11-02, achado 11 (`docs/discovery/2026-11-02-auditoria-ponytail.md`)

## Problema
digitar "Cadastrar cliente" com duas pausas cria `cadastrar.md`, depois `cadastrar-cliente.md`, e a cada passo lê as outras páginas para corrigir links. Links externos para o arquivo antigo quebram, e o git vê várias renomeações.

## Critérios de aceite
- [ ] só renomear o arquivo no `flush` ao sair da página ou depois de 5 s sem digitar; enquanto isso, gravar o título no frontmatter no mesmo arquivo. Em `relink`, só abrir páginas que mencionam o nome (busca simples antes de regravar já existe; falta evitar a releitura completa quando nada cita).
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
`src/core/pages.ts:116-133` (novo arquivo, `updateManual`, `rm` do antigo) e `:138-150` (`relink` lê e regrava cada página que citar o arquivo; lê todas); disparo em `web/src/layout/PageView.tsx:84-87` e `useStudio.ts:274-281`.

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`. Detalhes, cenário e correção na seção 11 da auditoria.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
