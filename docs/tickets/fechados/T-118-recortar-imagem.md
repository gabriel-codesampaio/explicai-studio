# T-118: Recortar imagem

- Prioridade: P2
- Tamanho: G
- Status: feito
- Agente: frontend (+ design, qa)
- Depende de: T-116 (reusa o mesmo endpoint "substituir imagem" com gravação temp+rename; não crie outro)
- Origem: `docs/discovery/dimensionar-imagens.md`, leitura 2. Em 2026-11-03 a pessoa pediu o recorte também ("ferramenta bem completa").

## Decisões
- O recorte é destrutivo, como no T-116: o canvas grava um arquivo novo completo no mesmo caminho e apaga o original. SVG e GIF animado são recusados.
- As marcações são remapeadas, em vez de recusar o recorte:
  - ponto: `x' = (x - cx) / cw`, `y' = (y - cy) / ch`;
  - retângulo: interseção com a área de recorte, depois a mesma conta;
  - o que fica todo fora some: marcador, área clicável e seta com qualquer ponta fora;
  - marcadores são renumerados.
- Antes de aplicar, a confirmação lista as marcações que vão sumir.

## Critérios de aceite
- [x] Ferramenta Recortar no editor de marcação: um retângulo com alças e proporção livre, que reaproveita o código de destaque. Desfazer funciona até aplicar.
- [x] Aplicar grava a imagem recortada no mesmo caminho (temp+rename, sem bytes depois do `IEND`, sem EXIF). O Markdown não muda.
- [x] As marcações são remapeadas pela regra e ficam sobre o mesmo pixel depois do recorte (teste de unidade da função de remapeamento + e2e que mede).
- [x] A confirmação mostra "N marcações serão removidas" quando houver. Cancelar não muda nada.
- [x] Numeração e legenda são refeitas depois de remover marcadores.
- [x] O export novo usa a proporção nova (`imageSize`).
- [x] Textos em pt-BR e en, atalho em Atalhos (`TOOL_KEYS`).

## Como verificar
`npm run check`. Vitest com `--maxWorkers=2`, Playwright com `--workers=2` só nos specs da área.

## Registro
Commit 4cac12b. Remapeamento puro em web/src/lib/cropAnnotations.ts (4 testes); CropPanel lista o que some com pixels inteiros; reaproveita o endpoint do T-116. Revisado e design conferido (1280 e 375 claro). e2e recortar+ocultar+imagem 47/47, vitest web 204. Limites: o retângulo só se ajusta com Selecionar (V) e com mouse; sair com recorte não aplicado descarta sem perguntar; se a gravação do JSON falhar depois da imagem, a tela pede salvar de novo.
