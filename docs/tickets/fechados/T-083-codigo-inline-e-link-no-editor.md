# T-083: Botão de código inline e fluxo de link: investigar e corrigir

- Prioridade: P2
- Tamanho: M
- Status: feito
- Agente: frontend
- Origem: pedido da pessoa em 2026-11-02 (acha que o código inline e o link não funcionam)

## Problema
A pessoa relata que o botão de código inline (Toolbar.tsx:73, SelectionMenu.tsx:70, toggleCode) e a parte de link (Link2/Ctrl+K, onEditLink, LinkPopover.tsx) não funcionam.

## Critérios de aceite
- [x] Causa achada e medida; código inline aplica e remove (com e sem seleção, barra, menu de seleção e atalho); link cria, edita, remove, recusa URL inválida, Ctrl+K, persiste após salvar/recarregar e sai no export; e2e cobrindo cada caso.

## Onde
web/src/features/editor/Toolbar.tsx, SelectionMenu.tsx, LinkPopover.tsx

## Como verificar
Skill diagnosticar no navegador real e e2e.

## Registro
Commits: 6676df0 (correção), 0cbce9e (e2e). Teste vermelho: web/test/inlineCode.test.ts. E2E: e2e/studio.texto.e2e.ts (12 casos).

Causa: a extensão `code` do Tiptap declara `excludes: "_"` e apaga toda outra marca. Ligar o código tirava o negrito, e o link recusava texto em código, embora o Markdown `**`x`**` e `[`x`](url)` abram com as duas marcas. Correção: `InlineCode = Code.extend({ excludes: "" })` em extensions.ts. `@tiptap/extension-code` entrou no package.json com `^3.32.0`, como as outras `@tiptap/*`; já era transitiva do StarterKit, sem pacote novo no lockfile.

### Análise 1: Toolbar.tsx, SelectionMenu.tsx, toggleCode
Medido no Chrome real (Playwright). Botões, atalho Ctrl+E (do StarterKit) e aria-pressed funcionam.

| Caso | Resultado | Evidência |
| --- | --- | --- |
| Barra: aplicar e remover na seleção | ok | e2e "barra: aplica e remove", aria-pressed false, true, false |
| Menu de seleção: aplicar e remover | ok | e2e "menu de seleção" |
| Ctrl+E na seleção; cursor no fim do código; sair e digitar | ok | e2e "atalho Ctrl+E" |
| Sem seleção, botão liga e o texto digitado vira código | ok | e2e "sem seleção" |
| Dentro de título, passo de lista, parágrafo | ok | e2e "convive"; continua depois de recarregar |
| Com negrito | FALHA: ligar o código apagava o negrito | vitest: recebido "texto `alvo`", esperado "texto **`alvo`**" |
| Com link | FALHA: link em cima do código era ignorado | vitest: recebido sem o `[..](url)` |
| Ida e volta Markdown | ok | web/test/inlineCode.test.ts e markdown.test.ts |
| Aparência claro e escuro | ok | e2e: fonte mono, borda 1px, fundo muda no escuro |
| Export | ok | HTML tem `<code>npm test</code>` e `.page-body code{font:.88em var(--mono)` |

### Análise 2: LinkPopover.tsx, onEditLink, Ctrl+K
Nenhum bug encontrado.

| Caso | Resultado | Evidência |
| --- | --- | --- |
| Criar com seleção (barra) | ok | e2e "cria com seleção"; aria-pressed true |
| Persistir após salvar e recarregar | ok | `[alvo](https://exemplo.com.br/ajuda)` no .md e mesmo href depois do reload |
| Export | ok | `<a href="https://exemplo.com.br/ajuda" rel="noopener noreferrer">` |
| Ctrl+K: foco no campo; Esc fecha e o foco volta ao texto | ok | e2e "Ctrl+K abre" |
| Sem seleção | ok | o link vale para o texto digitado em seguida |
| Editar e remover (cursor no link) | ok | campo vem com a URL atual; "Remover link" tira só a marca |
| URL inválida, com espaço, sem domínio | ok, recusa | role=alert, balão continua aberto |
| javascript:, data:, ftp: | ok, recusa | e2e "recusa endereço inválido e esquemas perigosos" |
| Markdown com javascript: | ok | sem href ativo no editor nem no export |
| Link para outra página | ok | studio.e2e.ts:278 |

Observação, sem bug: reabrir o balão pelo botão em menos de 0,5 s depois de aplicar um link não abre, porque o Radix ainda está fechando. Com Ctrl+K ou depois de uma pausa abre. Fica fora.

Ficou de fora: feedback extra ao aplicar o link (toast); o aria-pressed do botão já indica.
