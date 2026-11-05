# T-528: Esc na busca devolve o foco ao gatilho

- Prioridade: P2
- Tamanho: P
- Status: feito
- Agente: frontend
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado M3 (Médio)

## Problema
Na busca (Ctrl+P), depois de Esc o foco vai para "Pular para o conteúdo", no início do documento, em vez de voltar ao botão Buscar ou ao ponto de edição. Exportar, Ajuda, Lixeira, Versões e Aparência devolvem o foco ao gatilho. WCAG 2.4.3. Relacionado: T-424 (foco ao fechar menu ou diálogo), já fechado; conferir se o mesmo padrão cobre a busca.

## Critérios de aceite
- [x] Esc na busca devolve o foco ao elemento que estava focado antes de abrir (botão Buscar ou ponto de edição).
- [x] Se esse elemento não existir mais, o foco cai em algo visível, não no início do documento.
- [x] Os outros diálogos seguem como estão (testes verdes).

## Onde
Componente da busca (Ctrl+P) e a guarda de foco usada no T-424 (`onCloseAutoFocus`). Esforço do relatório: P.

## Como verificar
e2e: abrir a busca pelo botão e por Ctrl+P, apertar Esc, conferir `document.activeElement` nos dois casos.

## Registro
- Fechado na branch feat/ui-lote2-a. A busca não tem gatilho de diálogo, então o Radix não devolvia o foco. PageSearch guarda o último foco de fora (focusin com a busca fechada) e o devolve no `onCloseAutoFocus`; se o elemento sumiu, foca o `.ProseMirror`. e2e: Esc após o botão Buscar e após Ctrl+P no editor (e2e/studio.lote2a.e2e.ts).
