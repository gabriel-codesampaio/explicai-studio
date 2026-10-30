# T-040: Rodapé da barra lateral como a linha "Ajustes"

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: [Discovery do rodapé da barra](../../discovery/archives/2026-10-30-rodape-da-barra.md) (2026-10-30), opção A

## Problema
O rodapé da barra lateral era um "⋯" de 32 px sem texto, igual ao "⋯" da árvore de páginas mas com outro sentido. O menu era mais estreito que a coluna e não mostrava o estado do tema.

## Critérios de aceite
- [x] O gatilho é uma linha de largura total com o texto "Ajustes", no estilo de "Buscar página", sem ícone.
- [x] O menu tem a largura do gatilho e mantém Lixeira, Aparência e Atalhos.
- [x] "Aparência" mostra o tema atual (Claro, Escuro ou Sistema) em mono.
- [x] Foco volta a "Ajustes" ao fechar um painel, também na gaveta em 375 px (e2e).

## Registro
Commit na branch feature/t-040-rodape-ajustes. Verificado: `npm run check` verde, e2e 20/20 ("barra enxuta" e "tela estreita" agora procuram "Ajustes"), conferido no Chrome em 1280 px no tema escuro. Fora: atalho de teclado em "Atalhos" (não existe tecla global); contraste do texto cinza não medido; toque real não testado.

Nota (T-045): a pessoa pediu ícones nos itens e no gatilho depois deste ticket, e Idioma virou item próprio; o critério "sem ícone" acima deixou de valer. Ver [T-045](T-045-menu-ajustes.md).
