# T-134: HTML e Markdown de perfis diferentes se sobrescrevem

- Prioridade: P3
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: sobra do T-124 (2026-11-04)

## Problema
Só o PDF leva o perfil no nome. Exportar HTML ou Markdown para um perfil e depois para outro apaga o primeiro em `exportacao/`, e a pessoa pode entregar a versão do perfil errado.

## Critérios de aceite
- [ ] HTML e Markdown levam o perfil no nome ou na pasta, como o PDF.
- [ ] Export sem perfil mantém o nome de hoje.

## Onde
`src/core/export/`.

## Como verificar
Teste de export com dois perfis em seguida: os dois arquivos ficam em disco.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
