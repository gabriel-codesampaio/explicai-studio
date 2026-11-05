# T-567: Erro de cor sem pulo de layout

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: [discovery aparência do manual 2026-11-05 (F6)](../discovery/2026-11-05-aparencia-do-manual.md)

## Problema
Cor com contraste abaixo do mínimo mostra o erro colado ao campo e empurra os atalhos e os campos de baixo para cima e para baixo (layout salta). Depois de voltar ao valor antigo, o campo mantém o contorno vermelho (`a4-erro.png` na discovery).

## Critérios de aceite
- [x] A linha do erro fica reservada abaixo do campo: aparecer ou sumir o erro não muda o `top` dos campos seguintes (medir "Cor de realce" antes e depois).
- [x] Contorno vermelho só enquanto o erro existir; ao voltar a um valor válido, some.
- [x] A mensagem continua dizendo o número encontrado e o mínimo (texto vindo do core).
- [x] O erro está ligado ao campo para leitor de tela (`aria-invalid` e texto por `aria-describedby`), se ainda não estiver.

## Onde
`web/src/features/settings/ColorField.tsx`.

## Como verificar
Teste de unidade: valor abaixo de 4,5:1 mostra o erro; valor válido o remove. Medir `top` dos campos seguintes com script, antes e depois do erro.

## Registro
Feito em `feat/ui-aparencia` (da800f5). Erro sobreposto ao campo seguinte (absolute), sem mudar o layout; `aria-describedby`; some ao editar. Teste `colorField.test.tsx` e e2e de posição de "Cor de realce". Fora: linha reservada fixa (custaria 9 linhas vazias).
