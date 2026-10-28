import type { Editor } from "@tiptap/react";
import {
  Code2,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Table,
  type LucideIcon,
} from "lucide-react";

export interface BlockContext {
  editor: Editor;
  pickImage: () => void;
}

export interface Block {
  id: string;
  label: string;
  /** Explica o bloco no menu "/" e entra na busca. */
  hint: string;
  icon: LucideIcon;
  /** Palavras extras para achar o bloco digitando depois da "/". */
  keywords: string[];
  /** Aparece no seletor "tipo de bloco" da barra (os que transformam o parágrafo atual). */
  isTextType: boolean;
  isActive?: (editor: Editor) => boolean;
  run: (ctx: BlockContext) => void;
}

const chain = (editor: Editor) => editor.chain().focus();

/** Fonte única dos blocos: usada pelo seletor da barra de ferramentas e pelo menu "/". */
export const BLOCKS: Block[] = [
  {
    id: "paragraph",
    label: "Texto",
    hint: "Parágrafo comum",
    icon: Pilcrow,
    keywords: ["paragrafo", "texto"],
    isTextType: true,
    isActive: (e) => e.isActive("paragraph"),
    run: ({ editor }) => chain(editor).setParagraph().run(),
  },
  ...([1, 2, 3] as const).map(
    (level): Block => ({
      id: `h${level}`,
      label: `Título ${level}`,
      hint: level === 1 ? "Seção principal" : level === 2 ? "Subseção" : "Tópico dentro da subseção",
      icon: [Heading1, Heading2, Heading3][level - 1] ?? Heading1,
      keywords: ["titulo", "cabecalho", `h${level}`],
      isTextType: true,
      isActive: (e) => e.isActive("heading", { level }),
      run: ({ editor }) => chain(editor).setHeading({ level }).run(),
    }),
  ),
  {
    id: "steps",
    label: "Passos numerados",
    hint: "Um passo por linha, na ordem de uso",
    icon: ListOrdered,
    keywords: ["lista", "numerada", "passo", "etapas"],
    isTextType: true,
    isActive: (e) => e.isActive("orderedList"),
    run: ({ editor }) => chain(editor).toggleOrderedList().run(),
  },
  {
    id: "bullets",
    label: "Lista",
    hint: "Itens sem ordem",
    icon: List,
    keywords: ["lista", "marcadores", "itens"],
    isTextType: true,
    isActive: (e) => e.isActive("bulletList"),
    run: ({ editor }) => chain(editor).toggleBulletList().run(),
  },
  {
    id: "quote",
    label: "Citação",
    hint: "Trecho em destaque ou observação",
    icon: Quote,
    keywords: ["citacao", "observacao", "nota"],
    isTextType: true,
    isActive: (e) => e.isActive("blockquote"),
    run: ({ editor }) => chain(editor).toggleBlockquote().run(),
  },
  {
    id: "code",
    label: "Bloco de código",
    hint: "Comandos e trechos de código",
    icon: Code2,
    keywords: ["codigo", "comando", "terminal"],
    isTextType: true,
    isActive: (e) => e.isActive("codeBlock"),
    run: ({ editor }) => chain(editor).toggleCodeBlock().run(),
  },
  {
    id: "image",
    label: "Imagem",
    hint: "Print da tela do sistema",
    icon: ImageIcon,
    keywords: ["imagem", "print", "foto", "captura", "tela"],
    isTextType: false,
    run: ({ pickImage }) => pickImage(),
  },
  {
    id: "table",
    label: "Tabela",
    hint: "3 × 3 com cabeçalho",
    icon: Table,
    keywords: ["tabela", "colunas", "campos"],
    isTextType: false,
    run: ({ editor }) => chain(editor).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
];

/** Busca sem acento e sem maiúsculas: "titulo" acha "Título". */
export function searchBlocks(query: string): Block[] {
  const q = normalize(query);
  if (!q) return BLOCKS;
  return BLOCKS.filter((b) => [b.label, b.hint, ...b.keywords].some((t) => normalize(t).includes(q)));
}

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
