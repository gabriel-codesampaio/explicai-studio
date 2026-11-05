# T-568: Foco volta ao gatilho ao fechar o diálogo

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: [discovery aparência do manual 2026-11-05 (F7)](../discovery/2026-11-05-aparencia-do-manual.md)

## Problema
Ao fechar a modal Aparência com Esc, o foco não volta ao gatilho: medido, cai em "Pular para o conteúdo". Aberta pelo menu Ajustes, o item some ao abrir e o foco se perde. O relatório de 1.0.0 dizia que a Aparência devolvia o foco; o caso do botão direto ainda precisa ser confirmado. A regra vale para todos os diálogos do Studio (WCAG 2.4.3 e padrão de diálogo modal do APG).

## Critérios de aceite
- [x] Esc e o botão Fechar devolvem o foco ao gatilho que abriu a modal (`document.activeElement`), inclusive quando o item do menu some ao abrir (o foco vai ao botão do menu que o abriu).
- [x] Mesma regra conferida nos outros diálogos abertos por menu (Exportar, Versões, Públicos, Passeio). O que falhar entra neste ticket.
- [x] "Pular para o conteúdo" não recebe o foco ao fechar um diálogo.

## Onde
`web/src/features/settings/ManualAppearanceDialog.tsx`; gatilho no menu de Ajustes (`MoreMenu.tsx`); o componente de diálogo compartilhado em `web/src/components/ui`, se o defeito estiver nele.

## Como verificar
Teste de unidade ou e2e: abrir pelo menu, fechar com Esc e com o botão, conferir `document.activeElement`. Repetir para cada diálogo listado (qa).

## Registro
Feito em `feat/ui-aparencia` (315a702). `MoreMenu` guarda o botão Ajustes como gatilho dos painéis abertos por item de menu; Esc e Fechar devolvem o foco a ele. E2E `studio.foco-dialogos.e2e.ts` cobre Aparência, Públicos, Exportar, Versões e Capa e rodapé, com Esc e Fechar. Fora: Passeio (popover que leva o foco ao conteúdo de propósito).
