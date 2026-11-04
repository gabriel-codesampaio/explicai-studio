# T-135: Menu de público sem trava contra dois cliques

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: sobra do T-124 (2026-11-04)

## Problema
Dois cliques seguidos no menu de público disparam duas gravações, e a última a chegar pode não ser a última escolhida.

## Critérios de aceite
- [ ] Enquanto uma troca está gravando, outra não dispara, ou a última escolha sempre vence.
- [ ] O menu mostra o valor que ficou gravado.

## Onde
`web/src/features/pages/AudienceMenu.tsx`.

## Como verificar
E2e com dois cliques seguidos e resposta atrasada.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
