# T-150: Prova do MCP em app de terceiro, com banco local

- Prioridade: P3
- Tamanho: M
- Status: adiado (não bloqueia release)
- Agente: supervisor
- Origem: sobra do T-125 (2026-11-04)

## Problema
O T-125 acabou no CodeLab porque o banco do app de terceiro recusou a credencial local. Falta provar o MCP num sistema de negócio de outra pessoa e comparar o resultado com um manual escrito à mão.

## Critérios de aceite
- [ ] App sobe com Postgres local descartável, sem tocar no banco nem no repositório de terceiros.
- [ ] Manual com dois perfis, gravado só pelas tools do MCP e fora do repositório do app.
- [ ] Comparação com o manual escrito à mão e custo em tokens no relatório. Defeito do MCP vira ticket.

## Como verificar
Abrir o manual no Studio com a pessoa.

## Registro
2026-11-06, tentativa parou no bloqueio. App: KingFix (`C:\Users\PC\Desktop\Kingfix\kingfix-app`; CLAUDE.md lido, nada alterado, `.env` e `senhas.txt` não abertos). Stack Next 15 + Prisma/Postgres + Clerk + Stripe. Bloqueios concretos:
1. Postgres local: não há Postgres instalado; o Docker existe mas o daemon está parado (`failed to connect to the docker API ... dockerDesktopLinuxEngine`). Subir exige iniciar o Docker Desktop e baixar a imagem `postgres`: ok da pessoa, com o agente `seguranca` antes.
2. Login: as telas autenticadas passam por Clerk (`@clerk/nextjs` 6) e exigem chaves de um projeto Clerk; sem elas o middleware não sobe. As chaves reais estão no `.env` do app (proibido usar). O modo sem chaves do Clerk cria um projeto de desenvolvimento na nuvem da Clerk: efeito externo, precisa de ok.
3. O repositório de terceiros já traz um manual à mão (`manual/manual-administrador.md`, ~37 KB) para a comparação, quando houver app rodando.
Para destravar: a pessoa inicia o Docker Desktop e libera uma chave Clerk de teste (ou aceita o modo sem chaves); aí o ticket segue (cópia do app em pasta temporária, banco descartável, `prisma migrate` + `seed`, dois perfis cliente/admin).
