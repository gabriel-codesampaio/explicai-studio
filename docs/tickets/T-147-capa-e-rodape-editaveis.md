# T-147: Editar a capa e o rodapé do manual

- Prioridade: P2
- Tamanho: G
- Status: aberto
- Agente: frontend
- Origem: pedido da pessoa (2026-11-04) e [discovery](../discovery/capa-e-rodape.md)

## Problema
Quem entrega o manual ao cliente não consegue dizer na capa de quem é, qual a versão e a data. O PDF não tem rodapé nem número de página: o único rodapé é a frase fixa no fim do documento.

## Decisão da pessoa (2026-11-04)
- Edição direta na capa, numa etapa própria.
- Com prévia.
- Data e versão em texto livre. O Studio só sugere; nunca preenche sozinho.
- Por manual, não por perfil.
- Sem imagem de fundo por enquanto.
- PDF sem número de página em Chrome anterior ao 131 é aceitável, com aviso.

## Etapa 1: campos, prévia e rodapé
`manual.json` ganha `cover` (`subtitle`, `author`, `version`, `date`: até 120 caracteres) e `footer` (`text` até 100 caracteres, `pageNumbers`), todos opcionais, sem subir a `version` do formato. Seção "Capa e rodapé" no diálogo de exportação, com prévia da capa e do rodapé ao lado dos campos. Capa e rodapé em arquivo próprio em `src/core/export/`, porque `html.ts` já está grande.

- [ ] Manual sem `cover` e `footer` exporta HTML e PDF idênticos aos de hoje.
- [ ] A capa mostra subtítulo, autor, versão e data, nessa ordem. Campo vazio não deixa espaço.
- [ ] Texto com `<`, `"`, `'`, `\` e quebra de linha sai literal no HTML e no CSS do PDF (teste).
- [ ] PDF: toda página, menos a capa, tem texto à esquerda e "n / total" à direita (teste lendo o PDF; em Chrome anterior ao 131, aviso em vez de erro).
- [ ] Texto acima do limite é recusado com o motivo, e nada é gravado.
- [ ] A prévia usa o mesmo código do export e muda enquanto a pessoa digita.
- [ ] Data e versão têm sugestão que a pessoa aceita com um clique ou ignora.
- [ ] Export com `audience` leva a mesma capa e o mesmo rodapé.
- [ ] 375 e 1280: sem rolagem horizontal, rodapé quebra linha, contraste da cor secundária de pelo menos 4,5:1. Textos em pt e en.
- [ ] `docs/manual-format.md` documenta os campos. O Markdown exportado não muda.

## Etapa 2: edição direta na capa
Depende da etapa 1. A pessoa clica no texto da capa, na prévia, e edita ali, gravando nos mesmos campos.

- [ ] Clicar em subtítulo, autor, versão ou data edita no lugar. Campo vazio aparece só na edição, com o exemplo, e nunca no export.
- [ ] Funciona só com o teclado e é anunciado por leitor de tela; o formulário da etapa 1 continua disponível.
- [ ] Mesmos limites e mesma gravação da etapa 1, sem caminho paralelo no core.
- [ ] Rodapé também editável no lugar, se não complicar. Se complicar, registre e deixe só o formulário.

## Fora
Imagem de fundo, valores por perfil, definir pelo MCP (`create_manual`, `export_manual`). Viram ticket só se o uso pedir.

## Como verificar
Exportar HTML e PDF de manual antigo e de manual novo. Print em 375 e 1280, uma vez por etapa. `/impeccable audit` na tela nova.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
