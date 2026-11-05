# T-208: Modelos de issue no GitHub, com "meu manual antigo não abriu"

- Prioridade: P2
- Tamanho: P
- Status: fechado
- Agente: frontend
- Marco: 0.4
- Origem: discovery [versao-1-0](../../discovery/archives/versao-1-0.md), lacuna 13 (2026-11-04)

## Problema
Canal de feedback: modelos de issue no GitHub (bug, sugestão, "meu manual antigo não abriu"). Sem usuário, é o único sinal que a 1.x terá.

## Critérios de aceite
- [x] O que a lacuna 13 descreve, feito e verificado conforme a discovery (seções "O que 1.0 promete" e "Critérios de pronto").
- [x] Documentado onde a discovery indica.

## Como verificar
Conforme a discovery; evidência no Registro.

## Registro
- Commit: 8f975c1
- Feito: `.github/ISSUE_TEMPLATE/` com bug, sugestão, "meu manual antigo não abriu" (versão do Studio, versão de criação, erro, manual.json sem dado sensível) e config.yml sem issue em branco. YAML parseado com `yaml`.
- Fora: link no README (a discovery não indica onde); labels `bug`, `sugestão` e `compatibilidade` precisam existir no repo; contar issues "não abriu" só após publicar.
