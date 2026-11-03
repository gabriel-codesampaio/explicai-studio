# T-118: Recortar imagem

- Prioridade: P2
- Tamanho: G
- Status: aberto
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
- [ ] Ferramenta Recortar no editor de marcação: um retângulo com alças e proporção livre, que reaproveita o código de destaque. Desfazer funciona até aplicar.
- [ ] Aplicar grava a imagem recortada no mesmo caminho (temp+rename, sem bytes depois do `IEND`, sem EXIF). O Markdown não muda.
- [ ] As marcações são remapeadas pela regra e ficam sobre o mesmo pixel depois do recorte (teste de unidade da função de remapeamento + e2e que mede).
- [ ] A confirmação mostra "N marcações serão removidas" quando houver. Cancelar não muda nada.
- [ ] Numeração e legenda são refeitas depois de remover marcadores.
- [ ] O export novo usa a proporção nova (`imageSize`).
- [ ] Textos em pt-BR e en, atalho em Atalhos (`TOOL_KEYS`).

## Como verificar
`npm run check`. Vitest com `--maxWorkers=2`, Playwright com `--workers=2` só nos specs da área.

## Registro
<!-- preenchido ao fechar -->
