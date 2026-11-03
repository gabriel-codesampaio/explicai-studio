# T-116: Ferramenta Ocultar dados sensíveis nos prints

- Prioridade: P1
- Tamanho: M
- Status: aberto
- Agente: frontend (+ design, qa)
- Origem: caderno (03/11) e `docs/discovery/ocultar-dados-sensiveis.md`, corte mínimo (seção 8). Decisões aceitas pela pessoa em 2026-11-03.

## Problema
Prints de sistema de cliente trazem nome, CPF, e-mail e valores. Hoje não há como esconder isso no Studio antes de exportar ou compartilhar o manual.

## Decisões
- Só tarja sólida, queimada nos pixels. Borrão e pixelização ficam fora porque dá para reverter.
- O original é sempre apagado. Não há opção de guardar uma cópia.
- Cópias antigas nos exports: o Studio só avisa e não apaga.
- A tarja tem uma cor só.
- Se a pasta do manual estiver num repositório git, aparece um aviso fixo, porque o print original continua no histórico.

## Critérios de aceite
- [ ] Arrastar com `O` cria retângulos opacos redimensionáveis, fora da numeração e da legenda. O Desfazer funciona.
- [ ] Aplicar mostra uma confirmação que diz que a ação não tem volta e avisa sobre git e exports. Cancelar não muda nada.
- [ ] Depois de aplicar, todo pixel dentro dos retângulos fica na cor da tarja e os pixels de fora não mudam (teste lê os pixels do arquivo gravado).
- [ ] O arquivo gravado não tem bytes depois do `IEND` nem EXIF, foi escrito por temp + rename e manteve o tamanho em pixels.
- [ ] As referências no Markdown e as marcações no JSON continuam válidas sem edição.
- [ ] O original não existe mais em `assets/` nem na pasta de imagens sem uso. Um export novo traz só a versão tarjada.
- [ ] SVG e GIF animado: o botão recusa com mensagem clara.
- [ ] Sair com rascunho pergunta antes. Textos em pt-BR e en.
- [ ] Aviso fixo quando a pasta do manual está num repositório git.
- [ ] Item novo em Atalhos (`TOOL_KEYS`) e teste de `toolForKey("O")`.

## Fora do escopo
Borrão e pixelização, detecção automática e OCR, `redact_image` no MCP, ocultar várias imagens de uma vez, limpar o histórico do git e apagar exports antigos.

## Como verificar
- Teste de unidade da função que pinta, uma função pura sobre `ImageData`.
- e2e: arrastar, aplicar, reabrir o arquivo e medir os pixels; conferir que `assets/` não ficou com cópia.
- `npm run check`. Playwright com `--workers=2`.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
