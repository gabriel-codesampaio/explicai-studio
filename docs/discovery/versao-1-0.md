# Discovery: versão 1.0 do Explicaí (2026-11-04)

Pedido da pessoa: "Vamos começar a pensar na versão 1.0 do Explicaí". Sem pesquisa externa nesta rodada; tudo vem do repositório (`PRODUCT.md`, `docs/manual-format.md`, `docs/tickets/README.md`, `src/core/manuals.ts`, `src/core/types.ts`). O que não está lá marca-se como hipótese. Complementa [importar-manual.md](importar-manual.md) e [personalizar-marcacoes.md](personalizar-marcacoes.md).

## Problema

Hoje Studio (0.3.0 no npm; o `package.json` desta branch ainda diz 0.2.1, a branch está atrás) e MCP (0.1.0) mudam sem promessa. Quem põe o Explicaí no fluxo de entrega (software house, dev solo) precisa saber que a pasta de manual de hoje abre e exporta igual daqui a um ano. Sem essa promessa, "1.0" é só um número. Hipótese, sem evidência: `PRODUCT.md` registra que não há usuário, depoimento nem número de uso. A 1.0 promete estabilidade a quem ainda não existe, então o risco principal é congelar a coisa errada.

## O que "1.0" promete

1. **Formato v1 estável.** `manual.json`, página, `assets/*.json` e `.versoes/` mudam só por acréscimo (campo opcional novo, valor novo numa lista). Nada some, nada muda de sentido. `FORMAT_VERSION` continua 1 enquanto for assim.
2. **Compatibilidade para trás.** Todo manual criado a partir da 0.1 abre, edita e exporta na 1.x. Prova: manuais de fixture de cada versão no teste.
3. **Compatibilidade para frente, com aviso.** Manual de formato maior que o suportado abre com mensagem clara ("atualize o Studio") e não é regravado. Hoje só lança erro (`manuals.ts:60`).
4. **Migração.** Sem migração na 1.0: não há v2. Existe a regra escrita: v2 só com comando `explicai migrate`, backup antes e leitura de v1 mantida pela 1.x toda.
5. **Semver dos pontos de contato:** formato em disco, `explicai/core` (exports), flags do CLI, nomes e schemas das tools e prompts do MCP. A API HTTP local do Studio fica fora (uso interno); dizer isso.
> Decisão posterior da pessoa (2026-11-04): só o Studio (`explicai`) vai a 1.0; o MCP segue 0.x, com semver próprio. Vale sobre os itens 6 e a pergunta 1 abaixo.

6. **Studio e MCP andam juntos.** O MCP declara a faixa de `explicai` que aceita; versão fora da faixa dá erro com instrução. Hipótese a conferir: `contract.test.ts` já cobre parte.
7. **Limites declarados:** PDF exige Chrome, Edge ou Chromium na máquina; "público" não é controle de acesso (já está no formato); sem captura de tela, sem colaboração.

## Critérios de pronto da 1.0

- **Qualidade:** CI estável (T-127, T-129 resolvidos), QA da imagem fechado (T-064), nenhum bug P0 ou P1 aberto, suíte completa na main antes da tag. Teste de retrocompatibilidade com fixtures 0.1, 0.2 e 0.3. Round-trip sem perda de campo desconhecido também em `manual.json` e `assets/*.json` (hoje só o frontmatter está documentado; hipótese de perda, verificar).
- **a11y (WCAG 2.2 AA, compromisso do `PRODUCT.md`):** axe em todas as telas e estados do Studio e no HTML exportado; T-171, T-173, T-174, T-176, T-177 fechados; uma passada manual com leitor de tela (NVDA) nos três fluxos principais.
- **Desempenho:** metas numéricas definidas e medidas, não só "medir": abrir manual de 500 páginas (T-106), PDF com 100 imagens (T-105), digitação sem engasgo. A meta é decisão da pessoa (ver dúvidas).
- **Docs:** README pt/en revisado, `manual-format.md` com a seção de compatibilidade, README do MCP, CHANGELOG com a 1.0, um manual de exemplo completo em `exemplos/`, nota "como o formato evolui".
- **Site/landing (`explicai-website`):** a página existe (pt na raiz, en em `site/en/`). Para a 1.0: atualizar versão e comandos, demo conferida, links do npm e do GitHub, sem prometer o que a 1.0 não entrega. Landing não mede sucesso por conversão (discovery da landing).
- **i18n:** pt-BR e en-US completos no Studio, no HTML exportado e nas mensagens do core/MCP; teste que falha se faltar chave em uma das línguas (hipótese: hoje a paridade é conferida à mão); T-166 (vocabulário dos status).
- **Segurança:** agente `seguranca` na tag final (já é regra do projeto); `npm audit` limpo ou justificado.
- **Prova de uso real:** T-125 (CodeLab) feito; T-150 (app de terceiro com banco local) feito. É a única evidência que a 1.0 terá. Meta de piso: pelo menos 2 manuais reais de fora do autor exportados sem ajuste manual de arquivo (hipótese de número, a pessoa decide).

## Tickets abertos: o que entra

Regra: entra como obrigatório o que (a) muda o formato ou nome público, porque depois da 1.0 custa mais, (b) quebra a promessa "nada se perde", (c) é bug P1 ou a11y AA, (d) dá prova ou confiança de release. O que for só acréscimo de interface pode esperar a 1.x.

| Grupo | Obrigatório | Desejável | Depois |
|---|---|---|---|
| Bugs P1 | T-151, T-152, T-153, T-171 | | |
| Nada se perde | T-161 (limpar lixeira), T-163 (conflito mostra diferença) | T-154, T-155, T-156 | T-130 |
| Nomes (viram contrato) | T-158, T-159, T-166 | T-164 | T-167 |
| Marcação e formato (lote de hoje) | T-190, T-191, T-192, T-193, T-195, T-197 | T-194, T-196 | T-184 |
| Públicos e Aparência | T-186 (muda API/formato de `audiences`) | T-187, T-188, T-185 | T-189, T-135 |
| UI do lote de hoje | | T-179, T-180, T-181, T-182, T-183 | |
| a11y | T-173, T-174, T-176 | T-177, T-157, T-162, T-165 | T-170, T-169 |
| Qualidade e prova | T-127, T-129, T-064, T-037, T-150 | T-128 | |
| Desempenho | T-105, T-106 | T-149 | T-031 |
| MCP | T-197 | T-178 (só o teste "manual v1 antigo abre"; ver lacuna 2) | prompt `import_manual` (resto de T-178) |
| Outros | | T-147 (decidir, ver dúvidas) | T-148, T-104 |

Notas:
- T-190, T-193 e T-195 só são obrigatórios se mexem em campo existente ou criam campo; como `style` é opcional e aditivo, nada impede fazê-los na 1.1. Entram antes porque o lote já está em curso e é mais barato fechar o desenho do `style` uma vez, ligado ao T-197 (MCP com paridade).
- T-186 precisa de decisão de formato antes: renomear público reescreve `audience:` em várias páginas (muda arquivos do usuário). Confirmar no ticket que a operação é atômica e desfaz-se pela lixeira/versões.

## Lacunas sem ticket (propostas)

1. Política de compatibilidade e semver escrita em `docs/manual-format.md` e no README (o que é contrato, o que é interno).
2. Fixtures congeladas de manual 0.1, 0.2 e 0.3 + teste "abre, edita, salva, exporta" em cada uma.
3. Verificar e testar que `manual.json` e `assets/*.json` preservam campo desconhecido ao regravar (Studio e MCP).
4. Manual de formato maior que o suportado: abrir só leitura com mensagem acionável, nunca regravar; documentar o caminho `explicai migrate` para uma v2.
5. Faixa de versão Studio/MCP: o MCP checa a versão de `explicai` e explica o desencontro.
6. Publicar `explicai-mcp` no npm (hoje 0.1.0 sem publicar, segundo `passagem.md`) e definir se sobe a 1.0 junto com o Studio.
7. Matriz de plataforma e Node no CI (Windows, macOS, Linux; Node LTS do `engines`). Hipótese: o desenvolvimento é só em Windows.
8. Auditoria de a11y completa (axe em todas as telas e estados + leitor de tela) como ticket de marco, não só os achados soltos.
9. Metas de desempenho numéricas e teste de orçamento no CI (abrir, salvar, exportar).
10. Teste de paridade de chaves pt/en (Studio, HTML exportado, core, MCP).
11. Docs da 1.0: guia de primeiros passos, exemplo completo, CHANGELOG da 1.0 e seção de compatibilidade no README do MCP.
12. Checklist de release 1.0: `seguranca`, `npm audit`, tag, notas de versão pt/en, landing atualizada. Post do blog só quando a pessoa pedir.
13. Canal de feedback: modelos de issue no GitHub (bug, sugestão, "meu manual antigo não abriu"). Sem usuário, é o único sinal que a 1.x terá.

## Riscos

- **Congelar cedo demais, sem usuário.** Mitigação: promessa só de "acréscimo", sem prometer a UI; a UI muda livremente.
- **Lote de hoje muda o formato** (`style` por marcador, destaque com preenchimento e borda, T-193/T-195). Se a 1.0 sair antes de fechar o desenho, a primeira mudança incompatível vira v2. Mitigação: fechar o formato no marco 0.5 e só então anunciar a faixa 1.0.
- **T-186 reescreve arquivos do usuário** (renomear público). Risco de perda; precisa de teste e de desfazer.
- **Escopo infinito:** são 70 tickets abertos, a maioria P2 e P3. Sem corte, a 1.0 nunca sai. A tabela acima corta de propósito.
- **Testes instáveis** escondem regressão (T-127, T-129).
- **Dependência de Chrome local** para PDF: fora do controle do projeto; documentar, não prometer.
- **Dev só em Windows** (hipótese): bug de caminho em macOS e Linux só aparece com usuário.
- **Branch atrás da main** (versão 0.2.1 no `package.json` aqui): conferir a versão antes de qualquer tag.

## Opções

| Opção | Ganho | Tamanho | Risco | Fica de fora |
|---|---|---|---|---|
| A. 1.0 = estabilidade de formato e contrato (recomendada) | Promessa clara e verificável; corte pequeno | G (3 marcos) | Congelar o `style` ainda em desenho | UI desejável, importação, passeio, refatorações |
| B. 1.0 = só renomear a 0.3 com política escrita | Rápida | P | Promessa sem prova (sem fixtures, sem a11y auditada) | quase tudo |
| C. 1.0 = fila inteira zerada | Produto "completo" | G+ (meses) | Nunca fecha; usuário só chega depois | nada |

Recomendação: **A**. B falha no critério "nada se perde" sem as fixtures; C não termina. Para saber se vale subir de ritmo depois: contar issues "meu manual não abriu" e manuais de terceiros no GitHub; se zerar, a 1.x pode focar em importação (T-178) e passeio (T-148).

## Marcos

- **0.4 "Sem perda e sem susto".** P1: T-151, T-152, T-153, T-171. Dados: T-161, T-163. Nomes: T-158, T-159, T-166. CI: T-127, T-129, T-064. Lacunas 1, 2, 3, 6 (publicar o MCP) e 13. Saída: nenhum bug P1 aberto, fixtures no CI, MCP publicado.
- **0.5 "O formato fecha".** Lote de hoje: T-190, T-191, T-192, T-193, T-195, T-197; públicos: T-186, T-187; Aparência: T-188; desejáveis T-194, T-196, T-179 a T-183, T-185 conforme sobrar. Lacunas 4, 5. Saída: `manual-format.md` sem pendência, texto da política de compatibilidade publicado. Daqui para a frente, só acréscimo.
- **0.9 (candidata) "Qualidade".** a11y: T-173, T-174, T-176 (+ T-177) e a auditoria completa (lacuna 8). Desempenho: T-105, T-106, metas (9). T-037, T-150 e a prova com 2 manuais de fora. i18n (10). Matriz de plataforma (7). Docs e landing (11). Congelamento de funcionalidade: só correção.
- **1.0.** Checklist de release (12): suíte completa na main, `seguranca`, `npm audit`, tag, notas pt/en, landing. Studio e MCP publicados juntos, com a faixa de versão declarada. Nenhuma funcionalidade nova no marco.
- **Depois (1.1+):** T-178 (prompt `import_manual`), T-148, T-170, T-169, T-184, T-189, T-031, T-104, T-130, T-135, T-167; formato por acréscimo (capa e rodapé, T-147, se a pessoa preferir fora do 0.5).

## Decisões da pessoa (2026-11-04)

- **Só o Studio sobe para 1.0.** O MCP segue 0.x, publicado à parte (T-220), declarando a faixa de `explicai` que aceita. A promessa 6 vale como "MCP declara a faixa", não "andam juntos".
- **T-147 (capa e rodapé) entra antes da 1.0**, no marco 0.5, depois do T-188.
- **Sem piso de prova real:** a 1.0 sai sem manuais de terceiros. Mitigação: promessa só de acréscimo e canal de feedback (T-208).
- **macOS e Linux: melhor esforço declarado, com CI nas três** (T-203).
- Metas de desempenho: medir antes de fixar (T-205). Renomear público reescreve `audience:` com confirmação (já no T-186/T-187).

## Perguntas só da pessoa (respondidas acima)

1. **Studio e MCP sobem juntos para 1.0?** Recomendo sim, mesma versão maior, para a faixa de compatibilidade ficar simples.
2. **T-147 (capa e rodapé editáveis) entra antes da 1.0?** Recomendo não: é campo novo opcional e cabe na 1.1 sem quebrar a promessa.
3. **Piso de prova real:** quantos manuais de fora do autor antes da tag? Recomendo 2 (T-150 mais um convidado), sem número de uso.
4. **Metas de desempenho:** recomendo abrir 500 páginas em menos de 2 s e PDF de 100 imagens em menos de 60 s numa máquina média. Chute para debater, não medido.
5. **Suporte a macOS e Linux é promessa da 1.0 ou "melhor esforço"?** Recomendo melhor esforço declarado, com CI nas três, até aparecer usuário.
6. **T-186 renomear público:** aceitar reescrever `audience:` nas páginas? Recomendo sim, com confirmação mostrando quantas páginas mudam.

## Rascunho de spec (opção A, marco 0.4 como primeira fatia)

**Escopo.** (1) Seção "Compatibilidade" em `docs/manual-format.md` com a política de acréscimo, semver dos pontos de contato e regra de migração. (2) Pasta `test/fixtures/manuais-antigos/` com manuais 0.1, 0.2 e 0.3 e teste que abre, edita uma página, salva e exporta HTML e Markdown. (3) Teste de round-trip de campo desconhecido em `manual.json` e `assets/*.json`; correção se perder. (4) Abertura de formato maior que 1 em modo leitura com mensagem acionável. (5) Fila dos obrigatórios do marco 0.4 aberta como lote.

**Critérios de aceite.**
- [ ] `manual-format.md` define o que é contrato e o que é interno, e diz que a v1 só cresce por acréscimo.
- [ ] Fixtures de 0.1, 0.2 e 0.3 passam no CI nas três plataformas.
- [ ] Campo desconhecido em `manual.json` e `assets/*.json` sobrevive a editar e salvar (Studio e MCP), ou o limite está documentado.
- [ ] Manual com `version: 2` abre sem ser regravado e mostra "atualize o Studio" (pt e en).
- [ ] Nenhum ticket P1 aberto ao fim do marco; T-127 e T-129 fechados.

**Riscos.** Fixture antiga pode revelar perda real de dado (vira bug P1). Política escrita cedo demais trava o desenho do `style`: por isso o texto final só sai no marco 0.5. Tocar `FORMAT_VERSION` só com decisão da pessoa.
