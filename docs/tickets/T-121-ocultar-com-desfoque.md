# T-121: Ocultar com desfoque, além da tarja

- Prioridade: P2
- Tamanho: P
- Status: concluído
- Agente: frontend (+ design, qa)
- Origem: pedido da pessoa em 2026-11-03, ao testar o T-116 ("adicione uma personalização pra desfocar"). Reabre só o ponto do discovery que tinha descartado o borrão; as outras decisões do T-116 continuam.

## Problema
A tarja sólida do T-116 fica pesada no print. A pessoa quer a opção de desfocar a área.

## Decisões
- No painel Ocultar, escolha de estilo entre **Tarja** (padrão) e **Desfoque**. A escolha vale para todas as áreas da aplicação e é lembrada por manual ou em localStorage, o que for mais simples.
- O desfoque tem de ser forte o bastante para não ser revertido, porque borrão leve dá para reverter. Pixelar com blocos grandes, de no mínimo ~1/4 da altura da área e não menos que 12 px, e depois borrar por cima, com tudo queimado nos pixels. Pixelar só deixa ruído, e a reconstrução de texto fica impraticável.
- Aviso curto no painel quando Desfoque estiver ativo: "Para senha, CPF e números, prefira a tarja."
- O resto é como no T-116: arquivo novo no mesmo caminho (temp+rename), original apagado, mesmas recusas (SVG/GIF) e mesmos avisos de git e exports.

## Critérios de aceite
- [ ] Seletor Tarja/Desfoque no painel Ocultar, em pt-BR e en, com Tarja como padrão.
- [ ] Em Desfoque, a prévia do rascunho mostra o efeito antes de aplicar.
- [ ] Teste de unidade da função que desfoca: os pixels de fora não mudam, e dentro da área nenhum bloco tem variação maior que o limite (prova de que o detalhe sumiu).
- [ ] e2e: aplicar com Desfoque, reabrir o arquivo e conferir que dentro mudou, fora não, e o tamanho se manteve.
- [ ] Aviso de "prefira a tarja" visível com Desfoque.

## Como verificar
Vitest `--maxWorkers=2`; Playwright `--workers=2` só em `studio.ocultar`. Design a 1280 em tema claro.

## Registro
Desfoque = pixelado (bloco max(12 px, 1/4 da altura)) + borrado, queimado nos pixels. Estilo lembrado em localStorage (explicai:ocultar-estilo). Prévia por backdrop-filter (aproximada). Extras no mesmo PR: rótulo "Editar imagem"; legenda com 3+ sem descrição vira selo "1–8", centralizada.
