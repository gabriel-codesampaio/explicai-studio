# T-528: Esc na busca devolve o foco ao gatilho

- Prioridade: P2
- Tamanho: P
- Status: aberto
- Agente: frontend
- Origem: [relatório UI/UX 2026-11-05](../discovery/2026-11-05-relatorio-ui-ux-e-features.md), achado M3 (Médio)

## Problema
Na busca (Ctrl+P), depois de Esc o foco vai para "Pular para o conteúdo", no início do documento, em vez de voltar ao botão Buscar ou ao ponto de edição. Exportar, Ajuda, Lixeira, Versões e Aparência devolvem o foco ao gatilho. WCAG 2.4.3. Relacionado: T-424 (foco ao fechar menu ou diálogo), já fechado; conferir se o mesmo padrão cobre a busca.

## Critérios de aceite
- [ ] Esc na busca devolve o foco ao elemento que estava focado antes de abrir (botão Buscar ou ponto de edição).
- [ ] Se esse elemento não existir mais, o foco cai em algo visível, não no início do documento.
- [ ] Os outros diálogos seguem como estão (testes verdes).

## Onde
Componente da busca (Ctrl+P) e a guarda de foco usada no T-424 (`onCloseAutoFocus`). Esforço do relatório: P.

## Como verificar
e2e: abrir a busca pelo botão e por Ctrl+P, apertar Esc, conferir `document.activeElement` nos dois casos.

## Registro
<!-- preenchido ao fechar: commit, o que foi feito, o que ficou de fora -->
