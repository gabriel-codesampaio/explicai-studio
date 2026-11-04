# Manuais antigos (congelados)

Um manual por versão publicada do Studio (`0.1`, `0.2`, `0.3`), montado só com o que o `docs/manual-format.md` daquela tag descrevia: `0.1` (árvore, `status`, versão publicada, link e área clicável), `0.2` (`theme` com fontes e logo, cor de texto, alerta, `display`) e `0.3` (`audiences` e `audience`). O `test/old-manuals.test.ts` copia cada pasta para um diretório temporário, abre, edita uma página, salva e exporta HTML e Markdown.

Regras: não edite estes arquivos nem reformate (o Biome os ignora de propósito). Formato novo ganha pasta nova (`0.4`…), nunca muda uma antiga. Se o teste falhar aqui, o código quebrou a compatibilidade: conserte o código, não a fixture.
