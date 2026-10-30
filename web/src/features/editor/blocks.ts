import type { Editor } from "@tiptap/react";
import {
  CircleCheck,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  List,
  ListOrdered,
  type LucideIcon,
  Pilcrow,
  Quote,
  Table,
} from "lucide-react";
import { t } from "../../lib/i18n";
import { fold } from "../../lib/text";

export interface BlockContext {
  editor: Editor;
  pickImage: () => void;
}

/** Grupos do menu "/", na ordem em que aparecem. A ordem dos itens dentro do grupo é a de BLOCKS. */
export const BLOCK_GROUPS = [
  { id: "estrutura", label: t("Estrutura") },
  { id: "passos", label: t("Passo a passo") },
  { id: "midia", label: t("Mídia") },
] as const;

export type BlockGroupId = (typeof BLOCK_GROUPS)[number]["id"];

export interface Block {
  id: string;
  label: string;
  group: BlockGroupId;
  icon: LucideIcon;
  /** Palavras extras para achar o bloco digitando depois da "/". */
  keywords: string[];
  /** Aparece no seletor "tipo de bloco" da barra (os que transformam o parágrafo atual). */
  isTextType: boolean;
  isActive?: (editor: Editor) => boolean;
  run: (ctx: BlockContext) => void;
}

const chain = (editor: Editor) => editor.chain().focus();

/**
 * "Resultado:" é conteúdo do manual: segue o idioma do manual (o lang do artigo da página),
 * não o da interface. Fora da página (testes), português.
 */
function resultLabel(editor: Editor): string {
  const manualLang = editor.view.dom.closest("[lang]")?.getAttribute("lang") ?? "pt-BR";
  return manualLang.toLowerCase().startsWith("pt") ? "Resultado: " : "Result: ";
}

/**
 * Citação "**Resultado:** …" logo depois do bloco atual (dentro do passo, se estiver num).
 * Na linha vazia deixada pelo "/", ocupa o lugar dela. O cursor fica pronto para escrever.
 */
function insertResult(editor: Editor) {
  const label = resultLabel(editor);
  const { $from } = editor.state.selection;
  const empty = $from.parent.content.size === 0;
  const at = empty ? $from.before() : $from.after();
  const result = {
    type: "blockquote",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", marks: [{ type: "bold" }], text: label.trim() },
          { type: "text", text: " " },
        ],
      },
    ],
  };
  chain(editor)
    .insertContentAt(empty ? { from: at, to: $from.after() } : at, result)
    .setTextSelection(at + 2 + label.length)
    .run();
}

/** Fonte única dos blocos: usada pelo seletor da barra de ferramentas e pelo menu "/". */
export const BLOCKS: Block[] = [
  {
    id: "paragraph",
    group: "estrutura",
    label: t("Texto"),
    icon: Pilcrow,
    keywords: ["paragrafo", "texto", "comum", "paragraph", "text", "plain"],
    isTextType: true,
    isActive: (e) => e.isActive("paragraph"),
    run: ({ editor }) => chain(editor).setParagraph().run(),
  },
  ...([1, 2, 3] as const).map(
    (level): Block => ({
      id: `h${level}`,
      group: "estrutura",
      label: t("Título {n}", { n: level }),
      icon: [Heading1, Heading2, Heading3][level - 1] ?? Heading1,
      keywords: ["titulo", "cabecalho", "secao", "subsecao", "topico", "heading", "title", "section", `h${level}`],
      isTextType: true,
      isActive: (e) => e.isActive("heading", { level }),
      run: ({ editor }) => chain(editor).setHeading({ level }).run(),
    }),
  ),
  {
    id: "steps",
    group: "passos",
    label: t("Passos numerados"),
    icon: ListOrdered,
    keywords: ["lista", "numerada", "passo", "etapas", "steps", "numbered", "list"],
    isTextType: true,
    isActive: (e) => e.isActive("orderedList"),
    run: ({ editor }) => chain(editor).toggleOrderedList().run(),
  },
  {
    id: "result",
    group: "passos",
    label: t("Resultado esperado"),
    icon: CircleCheck,
    keywords: ["resultado", "esperado", "confirmacao", "passo", "result", "expected"],
    isTextType: false,
    run: ({ editor }) => insertResult(editor),
  },
  {
    id: "bullets",
    group: "estrutura",
    label: t("Lista"),
    icon: List,
    keywords: ["lista", "marcadores", "itens", "bullet", "list", "unordered"],
    isTextType: true,
    isActive: (e) => e.isActive("bulletList"),
    run: ({ editor }) => chain(editor).toggleBulletList().run(),
  },
  {
    id: "quote",
    group: "estrutura",
    label: t("Citação"),
    icon: Quote,
    keywords: ["citacao", "observacao", "nota", "destaque", "quote", "note"],
    isTextType: true,
    isActive: (e) => e.isActive("blockquote"),
    run: ({ editor }) => chain(editor).toggleBlockquote().run(),
  },
  {
    id: "code",
    group: "estrutura",
    label: t("Bloco de código"),
    icon: Code2,
    keywords: ["codigo", "comando", "terminal", "trecho", "code", "command", "snippet"],
    isTextType: true,
    isActive: (e) => e.isActive("codeBlock"),
    run: ({ editor }) => chain(editor).toggleCodeBlock().run(),
  },
  {
    id: "image",
    group: "midia",
    label: t("Imagem"),
    icon: ImageIcon,
    keywords: ["imagem", "print", "foto", "captura", "tela", "image", "screenshot"],
    isTextType: false,
    run: ({ pickImage }) => pickImage(),
  },
  {
    id: "table",
    group: "midia",
    label: t("Tabela"),
    icon: Table,
    keywords: ["tabela", "colunas", "campos", "table", "columns", "grid"],
    isTextType: false,
    run: ({ editor }) => chain(editor).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
];

const groupIndex = (b: Block) => BLOCK_GROUPS.findIndex((g) => g.id === b.group);

/** Busca sem acento e sem maiúsculas ("titulo" acha "Título"), já na ordem dos grupos do menu. */
export function searchBlocks(query: string): Block[] {
  const q = fold(query);
  const found = q ? BLOCKS.filter((b) => [b.label, ...b.keywords].some((k) => fold(k).includes(q))) : BLOCKS;
  return found.toSorted((a, b) => groupIndex(a) - groupIndex(b));
}

/** Separa a lista do menu por grupo; grupo sem bloco fica de fora. */
export function groupBlocks(blocks: Block[]) {
  return BLOCK_GROUPS.map((g) => ({ ...g, items: blocks.filter((b) => b.group === g.id) })).filter(
    (g) => g.items.length > 0,
  );
}
