# Manual de exemplo

Um manual completo, em português, para ver o formato funcionando de ponta a ponta. A pasta `financeiro/` é um manual de verdade: abre no Studio e exporta sem ajuste.

```bash
npx explicai docs/exemplo
```

(English: this is a complete sample manual in Portuguese. Open it with the command above.)

O que ele mostra:

- Três páginas em árvore: "Visão geral", com "Cadastrar cliente" e "Emitir cobrança" dentro.
- Passos numerados, cada um com "Resultado:", e um alerta de Dica.
- Um print (`assets/tela-clientes.svg`) com dois marcadores, um destaque, uma seta e uma área clicável que leva a "Cadastrar cliente". As posições estão em `tela-clientes.svg.json`.
- Etapas: "Visão geral" e "Cadastrar cliente" estão aprovadas.
- Uma versão guardada de "Cadastrar cliente", escolhida como a do manual (`published` em `manual.json`, arquivo em `.versoes/`).
- Um público, "administrador": só ele vê "Emitir cobrança". Exporte esse perfil para ver a diferença; os outros perfis recebem o manual sem essa página.

O print é um desenho simples em SVG, não uma tela real. No uso normal ele seria um PNG colado do seu sistema.

Para conferir e exportar sem o Studio, use `explicai/core`:

```js
import { checkManual, exportManual } from "explicai/core";

console.log(await checkManual("docs/exemplo/financeiro")); // []
await exportManual("docs/exemplo/financeiro", "html");
```

Exportar grava em `docs/exemplo/financeiro/exportacao/`. Não commite essa pasta.

Guia passo a passo: [primeiros-passos.md](../primeiros-passos.md) ([getting-started.md](../getting-started.md) em inglês). Formato: [manual-format.md](../manual-format.md).
