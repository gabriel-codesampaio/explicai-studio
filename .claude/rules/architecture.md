# Arquitetura

Princípios: SOLID, KISS e DRY. Quando eles conflitam, KISS vence: nada de abstração sem um segundo uso real.

## Camadas

```
core  ←  server  ←  web (pela API HTTP)
core  ←  explicai-mcp
```

- `src/core` não conhece HTTP nem navegador. Só formato e disco.
- `src/server` traduz HTTP para chamadas do core. Não tem regra de negócio.
- `web/src` não importa nada de `src/`. Fala com o servidor por `lib/api.ts`.

## Pastas

```
src/core/
  types.ts         tipos do formato
  fs.ts            disco: gravação atômica, caminho seguro, nome único
  tree.ts          árvore de páginas (busca, achatamento)
  slug.ts, frontmatter.ts, annotations.ts
  manuals.ts       operações de manual
  pages.ts         operações de página
  assets.ts        imagens e anotações
src/server/
  index.ts         monta o servidor
  router.ts        tabela de rotas
  http.ts          leitura e resposta HTTP
  security.ts      acesso só local
  routes/          um arquivo por recurso
web/src/
  App.tsx          só composição
  lib/             código sem React (API, rotas no hash, caminhos)
  hooks/           estado reutilizável (salvamento automático, dados do manual)
  features/        uma pasta por funcionalidade (editor, pages, manuals)
  components/      peças visuais genéricas do Explicaí
  components/ui/   componentes do shadcn (Radix + Tailwind); ajuste o visual pelos tokens, não aqui
  styles/          tokens.css (brand book → nomes do shadcn), base.css, editor-content.css
```

## Tailwind + shadcn

- O shadcn entra pelo comportamento (teclado, foco, leitor de tela). O visual vem do brand book via `styles/tokens.css`.
- Nada de cinza zinco, Inter ou `rounded-lg` por padrão: use `font-display`, `font-sans`, `text-muted-foreground`, `bg-marca-faixa` e o `--radius` da marca.
- Conteúdo do manual (títulos, listas, tabelas dentro do editor) fica em CSS próprio, porque é documento e não interface.

## Regras

- Um arquivo, uma responsabilidade. Arquivo passou de ~200 linhas ou mistura estado, interface e IO? Divida.
- Componente React: ou cuida de estado e dados, ou só desenha. Lógica vai para `hooks/` ou `lib/`.
- Nova rota no servidor = novo item na tabela de `routes/`, sem mexer no `router.ts` (aberto para extensão).
- Funções recebem o que precisam (dependências por parâmetro), sem ler estado global.
- Repetiu a mesma lógica pela segunda vez? Extraia. Pela primeira vez? Deixe onde está.
