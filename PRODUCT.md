# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pessoas que constroem ou mantêm software e precisam entregar manual, sem ter um time de documentação. Três perfis, com o mesmo peso:

- dev solo ou equipe pequena de SaaS;
- software house que entrega sistemas para clientes;
- redator técnico ou analista de suporte.

Momentos em que procuram o Explicaí: quando o sistema vai para o ar sem manual, quando o cliente pede o manual na entrega e quando uma tela muda e o manual fica desatualizado.

## Product Purpose

Propósito: documentar um sistema não pode custar mais que construí-lo.

O Explicaí Studio é um editor de manuais que roda localmente (`npx explicai`), no estilo do editor do Confluence. A pessoa cola texto e prints, organiza o conteúdo numa árvore de páginas, marca as imagens (marcadores numerados, destaques, setas e áreas clicáveis) e exporta em PDF, HTML ou Markdown. O Studio não captura tela: o print vem de fora.

O Explicaí Agent (servidor MCP, repositório `explicai-mcp`) monta manuais pela IA no mesmo formato.

Sucesso: o manual fica pronto no ritmo em que o código fica pronto, e quem lê não trava.

## Positioning

Construtor de manuais open source e gratuito. Cada manual é uma pasta de Markdown que pessoas e agentes de IA conseguem ler, versionada no git ao lado do código. Uma IA consegue montar o manual pelo MCP. A comunicação nunca cita nem se compara com concorrentes.

## Operating Context

- Uso em computador (desktop ou notebook), com teclado e mouse, normalmente com o sistema que está sendo documentado aberto ao lado. No celular, o Studio só precisa não quebrar.
- Roda em `localhost`, sem login e sem nuvem. Os arquivos ficam numa pasta de trabalho escolhida pela pessoa.
- Sessões longas de escrita e edição, alternando entre o Studio e o sistema documentado.
- O resultado é lido por pessoas (PDF, site HTML) e por agentes de IA (Markdown).

## Capabilities and Constraints

- Formato salvo: Markdown, uma página por arquivo, com frontmatter. As anotações de cada imagem ficam num JSON ao lado dela (`docs/manual-format.md`).
- Editor: Tiptap 3 com `@tiptap/markdown`. Abrir e salvar uma página não pode perder conteúdo.
- PDF gerado a partir do HTML exportado, com Chromium headless. Nenhuma dependência GPL ou AGPL, porque o projeto é MIT.
- Interface em português e inglês.
- Tom dos manuais gerados: profissional (padrão), tranquilo ou personalizado.
- Fora da v1: captura de tela, checagem automática do manual no sistema, colaboração em tempo real, versão hospedada com login e busca.
- Termos: "manual", "página", "subpágina", "marcador", "destaque", "área clicável".

## Brand Commitments

- Nome: Explicaí no texto, `explicai` em código, pacotes e domínios. Nunca "ExplicAI".
- Slogan: "Tira o print, que o Explicaí explica." Fica em português também na versão em inglês.
- Personalidade: o professor que você gostava. Didático, paciente e preciso, com humor pontual (nunca em mensagem de erro nem em passo de manual).
- Voz na interface: formal, com "você", uma ideia por frase. O botão diz o que acontece. O erro diz o que deu errado e como resolver.
- Endosso: "um projeto codesampa.io" no rodapé do site e do README. O fundador não aparece na interface.
- Brand book publicado em https://gabriel-codesampaio.github.io/explicai-brandbook/ (paleta, tipografia e logo já definidos).

## Evidence on Hand

- Brand book v0.2 e arquivos do logo (repositório `explicai-brandbook`).
- Nenhum usuário, depoimento, número de uso ou case real ainda. Não inventar.

## Product Principles

1. O manual acompanha o código: tudo que deixa o manual para trás do sistema está contra o produto.
2. Um manual, dois leitores: o que sai do Studio precisa servir a uma pessoa e a uma IA.
3. Nada se perde: abrir, editar e salvar nunca degrada o conteúdo.
4. Explica uma coisa por vez, na ordem em que a pessoa vai usar.

## Accessibility & Inclusion

WCAG 2.2 AA: contraste, operação completa por teclado, leitor de tela e foco visível. A fonte de texto (Atkinson Hyperlegible Next) foi escolhida para leitura com baixa visão.
