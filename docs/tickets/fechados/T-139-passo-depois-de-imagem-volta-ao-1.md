# T-139: Passo depois de imagem volta a numerar do 1

- Prioridade: P1
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: manual real do CodeLab (`assistir-a-uma-aula`), achado pela pessoa

## Problema
Markdown `1.`, imagem, `2.`, `3.` sai como 1, imagem, 1, 2 no HTML e no PDF. O marked gera `<ol start="2">`, mas o CSS zerava o contador `passo` em todo `ol` e o disco mostrava `counter(passo)`, ignorando o `start`.

## Critérios de aceite
- [x] HTML e PDF mostram 1, 2, 3 (medido no export do manual do CodeLab: 2, 3, 4, 5 depois da imagem).
- [x] Studio usa a mesma regra (`editor-content.css`); o serializador já preserva o `start` ao salvar (`extensions.ts`).
- [x] Teste cobre o `<ol start>` e o CSS.

## Registro
PR #31. O número do disco vem do contador nativo `list-item`, que respeita `start`; saíram `counter-reset` e `counter-increment`. Studio não conferido no navegador (só pela regra e pelo serializador). PDFs já gerados com o defeito precisam ser gerados de novo.
