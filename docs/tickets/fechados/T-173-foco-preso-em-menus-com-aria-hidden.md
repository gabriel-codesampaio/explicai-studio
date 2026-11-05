# T-173: Conferir o foco nos menus abertos com fundo aria-hidden

- Prioridade: P2
- Tamanho: P
- Status: concluído
- Agente: qa
- Origem: relatório UX 2026-11-04, achado B3 (avaliado no commit 60a0e3d)

## Problema
Achado B3, axe sério, critério 4.1.2. Há elementos focáveis dentro de `aria-hidden` no fundo com menus abertos. O foco parece preso no menu. Os menus são do Radix. Confirmar com leitor de tela se o foco escapa; se escapar, corrigir.

## Critérios de aceite
- [x] Axe sem violação de elemento focável dentro de aria-hidden com cada menu aberto.
- [x] Tab e Shift+Tab ficam dentro do menu aberto e não vão para o fundo.
- [ ] Teste com leitor de tela registrado no Registro (qual leitor, o que foi ouvido). **Lacuna**: sem leitor de tela na sessão.

## Onde
- Menus do Radix usados pelo Studio (confirmar a lista ao começar).

## Como verificar
Abrir cada menu, rodar axe e ciclar Tab. Repetir com um leitor de tela. Registrar o resultado no Registro.

## Registro
Commit: o que fecha este ticket (`fix(T-173)`).

Menus Radix do Studio (axe + ciclo de Tab, 1280 px, Chrome headless): Ajustes, Manual, Mais ações da página, Status, Público (popover), Nesta página (popover, 1000 px), Tipo de bloco, Fonte do trecho, Cor do texto, Opções da tabela, Select "Ver como", diálogos Exportar, Busca e Ajuda.

Antes: `aria-hidden-focus` (serious) em todo menu modal: o Radix põe `aria-hidden` no `.split:block` (barra lateral), no `<main>` e na ligação "Pular para o conteúdo", e eles continuam focáveis. O Tab não escapava (0 de 13 teclas fora do menu), então era só o aviso do axe.

Correção: `web/src/lib/inertWhenHidden.ts` (ligado em `main.tsx`) põe `inert` no fundo enquanto o `data-aria-hidden` do Radix existir. Achado de passagem: o popover "Nesta página" não tinha nome (`aria-dialog-name`, serious); ganhou `aria-label`.

Depois: `aria-hidden-focus` 0 em todos os menus acima; Tab e Shift+Tab ficam no menu (0 de 13 fora). `e2e/studio.menus-axe.e2e.ts` cobre Ajustes, Status e Mais ações. Rodado: `E2E_PORT=4493 npx playwright test e2e/studio.menus-axe.e2e.ts --workers=2` -> 2 passam.

Lacuna: leitor de tela real não foi testado (nenhum disponível na sessão); só axe e ciclo de Tab. Ficam moderados do axe com menu aberto (`region` no portal do Radix, `page-has-heading-one`), fora do escopo.
