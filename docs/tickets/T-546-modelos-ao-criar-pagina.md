# T-546: Escolher um modelo ao criar página: em branco, tarefa e referência

- Prioridade: P1
- Tamanho: M
- Status: aberto
- Agente: frontend
- Origem: [relatório de features 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), feature 7 (esforço P, risco B)

## Problema
Toda página nova de tarefa começa vazia; a pessoa refaz o mesmo esqueleto (objetivo, passos, resultado, problemas). Hipótese do relatório: o Confluence tem modelos de página (não confirmado na fonte). Aproveita o formato de passo com "Resultado:" que o `check` já cobra.

## Escopo
- Ao criar página, escolher entre "Em branco", "Tarefa passo a passo" e "Referência de campos".
- Texto em pt e en, na voz do brand book (`docs/marca-resumo.md`); revisão de voz com o `humanizer`.
- Sem modelos do usuário nesta versão (seria pasta nova no manual: decisão de formato).

Tamanho M: passo novo no fluxo de criar página, sem tela nova.

## Critérios de aceite
- [ ] Criar página mostra as três opções; "Em branco" mantém o comportamento de hoje.
- [ ] Modelos em pt e en, com o formato de passo com "Resultado:".
- [ ] Teclado: opções com foco e Enter; nome acessível.
- [ ] Texto de exemplo do modelo fica entre colchetes, para a pessoa trocar.
- [ ] Sem formato novo: `manual-format.md` não muda.

## Onde
Fluxo de criar página (editor e árvore) e o conteúdo dos modelos (texto no app).

## Como verificar
e2e: criar página em cada modelo e conferir o texto; teste de unidade do conteúdo; print de cada opção (um por tela).

## Dependências
`docs/marca-resumo.md`; revisão de voz com `humanizer`.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
