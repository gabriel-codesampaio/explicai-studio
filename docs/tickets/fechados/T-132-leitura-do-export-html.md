# T-132: Leitura do manual exportado em HTML

- Prioridade: P1
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: [Crítica do manual do piloto](../../discovery/archives/2026-11-04-critique-manual-piloto.md) (2026-11-04)

## Problema
O template do export atrapalha quem lê, principalmente no celular: o estilo de "Resultado:" nunca aparece, um print de 2560 px fica ilegível em 335 px, e numa página de 9142 px não há como navegar.

## Decisão
"Resultado:" se resolve no exportador, não no prompt: assim vale também para manual escrito à mão e para manual antigo. O formato do arquivo não muda.

## Critérios de aceite
- [x] Linha "Resultado:" logo depois de um passo sai com o destaque que o CSS já tem (`li>blockquote`), em HTML e PDF. O Markdown exportado segue legível.
- [x] Print largo em tela estreita pode ser ampliado: link para o original, sem JavaScript obrigatório. Funciona pelo teclado.
- [x] Sumário inclui as seções das páginas (o `--d` do CSS já suporta a profundidade).
- [x] No celular, o sumário pode ser recolhido (`details`), e cada página tem como voltar a ele.
- [x] "Próximo passo" ganha "anterior" se o gasto for pequeno. Se não, vira ticket.
- [x] Capa diz algo útil ao leitor em vez de "5 páginas".
- [x] Manual antigo exporta sem erro e sem perder conteúdo.

## Fora do escopo
Tema escuro no export: ninguém pediu.

## Onde
`src/core/export/`.

## Como verificar
Testes de export. Print em 375 e 1280 do manual do piloto. Conferir teclado e foco, que a crítica não olhou.

## Registro
Feito com fixture parecido com o manual do piloto; conferir no manual real no T-125. No celular o sumário começa aberto, porque sem JavaScript não dá para começar fechado só ali. "Resultado:" reconhece também "Result:". Sem tema escuro, como o ticket manda.
