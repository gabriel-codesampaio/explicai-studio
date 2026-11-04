# Crítica do manual do piloto no CodeLab, 2026-11-04

Feita pelo agente design em cima do export HTML, sem carregar a skill do impeccable nem a marca, por economia. Só 2 prints olhados; sem teclado, leitor de tela e impressão real. Vale como crítica leve. Tickets: T-131 e T-132.

# Critique UX: CodeLab Manual do Aluno (export HTML)
Nota: 6/10 (texto bom, trilha clara; vazio de imagem e template sem polimento de leitura).
Medido: 375 sem overflow (sw=375), página 9142px no celular, 1280 ok, fontes locais carregam, sem tema escuro (fundo #fff fixo), 5 itens no sumário sem subníveis, 11 "Print pendente", 1 imagem (lazy, 2560px).

## Nível 1: conteúdo (prompts em explicai-mcp/src/content.ts)
- ALTA. "Print pendente" vira callout "Nota" azul, igual a nota de verdade: 11 de ~17 callouts. Aluno lê como informação. Correção: prompt proíbe texto de pendência no corpo; pendência vai para metadado/lista no Studio. Sem print, nada no corpo.
- MÉDIA. "Resultado:" vem colado no fim do passo, mesma linha, sem destaque. Perde-se a verificação do passo. Correção: prompt emite o resultado no formato que o template destaca (ver N2-1), ou linha própria.
- MÉDIA. Passo "clique em responder" (pág 4) e "ícone de vídeo/círculo" (pág 3) sem rótulo exato nem posição. Aluno não acha o alvo. Correção: prompt exige nome literal do elemento ou posição na tela; sem isso, não escreve o passo.
- MÉDIA. Dica "Passe o mouse sobre o ícone" não existe no celular; público usa celular. Correção: prompt evita instrução só de hover ou dá alternativa.
- MÉDIA. Pág 5 junta Ranking (informativo, sem tarefa) com depoimento (tarefa) e termina em passo único + dúvida. Fecha manual sem fim. Correção: prompt separa informativo de tarefa e fecha com "pronto, você concluiu X" ou próximos passos.
- BAIXA. Falta caminho de erro no cartão (recusado, parcelas). Só há sucesso. Correção: prompt pede 1 alerta "se der errado" por tarefa com dinheiro.
- BAIXA. Typo "títular" (2x) copiado da UI; ou citar entre aspas ou corrigir. Nota "A imagem foi capturada em conta de administrador" é ruído para aluno (já sabido em parte).
- BAIXA. Jargão aceitável (Pix, CVV, CPF), mas "Ao final desta página, você consegue" repete 5x igual; ok como padrão, só variar não vale.

## Nível 2: template (explicai/src/core/export/)
- ALTA. CSS tem estilo para `li>blockquote` ("RESULTADO" em marca-texto amarelo) mas o export gera "Resultado:" em texto corrido. Recurso morto: o design pensou a verificação do passo e não chega. Correção: no exportador, converter linha iniciada por "Resultado:" em blockquote, ou o prompt gerar blockquote (decidir um lado).
- ALTA. Imagem no celular: print 2560px num quadro de 335px, texto ilegível, sem zoom/clique para ampliar. Correção: link/lightbox para original, ou `shot-full` com rolagem horizontal; recortar no prompt.
- MÉDIA. Sumário só com nível de página (5 itens), sem as seções h3. Em 9142px no celular o aluno não pula de "Comprar" a "Pix". Correção: incluir h3 (e h4) no sumário (--d já suporta profundidade).
- MÉDIA. Celular: sumário ocupa 238px antes do conteúdo, depois nenhuma navegação (sem voltar ao topo, sem sumário fixo/botão). Correção: sumário recolhível (details) e link "Voltar ao sumário" por página.
- MÉDIA. Sem anterior/próximo além do link "Próximo passo" em texto; ok mas sem "anterior". Baixa-média.
- BAIXA. Sem tema escuro (fundo e callouts fixos em #fff via color-mix). A pessoa não pediu; só registrar. Callout "warning" laranja e "caution" têm rótulo em mono 0.78em, pequeno (≈12px) mas contraste ok.
- BAIXA. Capa "5 páginas" não informa nada ao aluno; trocar por subtítulo/público. `aria-label` de callout role=note sem rótulo: ok.
- BAIXA. Imagem com loading=lazy e sem width/height no img (aspect-ratio no quadro compensa); sem CLS visível.

## O que está bom
Tipografia Atkinson Hyperlegible, corpo 16/1.65, linha de ~52rem; passos numerados em círculos, claros; callouts com cor + rótulo (não só cor); h3 e h4 hierarquizados; links internos "Próximo passo"; sem overflow no celular; fontes locais, funciona offline; impressão com quebra por página; anotações (marcador, destaque, legenda) bem feitas.
Conteúdo: objetivo declarado por página, ordem lógica (entrar, achar, comprar, assistir, comentar), passos curtos com verbo, mensagens exatas da UI entre aspas.

## Não conferi
Leitor de tela, teclado/foco (sem skip link; sumário é nav com label), contraste calculado por ferramenta (só inspeção), impressão real, tema escuro (não existe), prints além de 1280 claro e 375 (dois vistos), veracidade do conteúdo contra o CodeLab. Skills revisar-design/impeccable e marca não carregados (economia); critique feita direto.
Tokens: ~25 mil.
