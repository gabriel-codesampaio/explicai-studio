# T-147: Editar a capa e o rodapé do manual

- Prioridade: P2
- Marco: 0.5 (antes da 1.0, decisão da pessoa 2026-11-04; depois do T-188)
- Tamanho: G
- Status: aberto
- Agente: frontend
- Origem: pedido da pessoa (2026-11-04) e [discovery](../discovery/capa-e-rodape.md)

## Problema
Quem entrega o manual ao cliente não consegue dizer na capa de quem é, qual a versão e a data. O PDF não tem rodapé nem número de página: o único rodapé é a frase fixa no fim do documento.

## Decisão da pessoa (2026-11-04)
- Edição numa etapa própria: botão com ícone que abre um modal.
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

## Etapa 2: botão de edição na tela do manual
Depende da etapa 1. Ideia da pessoa (2026-11-04): "quando passar o mouse em cima, ter um botão com ícone de edição e abrir a edição da capa em uma modal, ou algo do tipo". O print dela marca o espaço logo depois do título, no cabeçalho da página do Studio.

- [ ] Ao passar o mouse no cabeçalho, um botão com ícone de edição aparece logo depois do título, sem deslocar o layout.
- [ ] O botão abre um modal com os campos da capa e do rodapé e a prévia, com os mesmos componentes da etapa 1, sem caminho paralelo no core.
- [ ] O botão também aparece com foco de teclado e fica sempre visível em tela de toque. Tem nome para leitor de tela e alvo de 44 px no toque.
- [ ] O modal fecha com Esc e devolve o foco ao botão. O que foi digitado não se perde sem aviso.
- [ ] Título longo quebra linha sem esconder o botão, em 375 e 1280.

O botão edita a capa do manual, não o título da página: o nome e a dica dele deixam isso claro. Se ficar confuso ao lado do título de uma página, teste a mesma posição junto ao nome do manual e registre a escolha.

## Fora
Imagem de fundo, valores por perfil, definir pelo MCP (`create_manual`, `export_manual`). Viram ticket só se o uso pedir.

## Como verificar
Exportar HTML e PDF de manual antigo e de manual novo. Print em 375 e 1280, uma vez por etapa. `/impeccable audit` na tela nova.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
