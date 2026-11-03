# T-113: Painel Aparência: foco sem fallback

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: preparação da versão de produção (2026-11-03)

## Problema
Se nenhum botão do seletor estiver marcado ao abrir o painel Aparência, o foco não vai para lugar nenhum.

## Critérios de aceite
- [ ] Foco cai no primeiro botão quando não há marcado.
- [ ] Teste cobrindo o caso; `npm run check`.

## Onde
web/src (painel Aparência)

## Como verificar
Teste da área primeiro (vermelho, depois verde); `npm run check`.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
