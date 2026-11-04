# T-134: HTML e Markdown de perfis diferentes se sobrescrevem

- Prioridade: P3
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: sobra do T-124 (2026-11-04)

## Problema
Só o PDF leva o perfil no nome. Exportar HTML ou Markdown para um perfil e depois para outro apaga o primeiro em `exportacao/`, e a pessoa pode entregar a versão do perfil errado.

## Critérios de aceite
- [x] HTML e Markdown levam o perfil no nome ou na pasta, como o PDF.
- [x] Export sem perfil mantém o nome de hoje.

## Onde
`src/core/export/`.

## Como verificar
Teste de export com dois perfis em seguida: os dois arquivos ficam em disco.

## Registro
HTML e Markdown de um perfil vão para `exportacao/html-<perfil>/` e `exportacao/markdown-<perfil>/` (o PDF já levava o perfil no nome); o PDF de perfil imprime o HTML da pasta do perfil. Sem perfil, nomes de sempre. Teste: dois perfis e sem perfil lado a lado. docs/manual-format.md e CHANGELOG atualizados. Quem lia `exportacao/html` esperando o último export de perfil agora deve usar o `file` do resultado.
