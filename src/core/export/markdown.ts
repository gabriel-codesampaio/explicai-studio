import { decodeUri, slugify } from "../text.js";
import { legendRows } from "./annotationShapes.js";
import type { Collected, ExportPage } from "./collect.js";
import { fontById } from "./fonts.js";
import { exportLevels } from "./headings.js";
import { type Labels, labelsFor } from "./labels.js";
import { assetFromSrc, type ImageInfo, stripHiddenLinks } from "./refs.js";
import { TEXT_COLORS } from "./textColors.js";

const IMAGE_LINE = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
/** Cor do texto: no Markdown para IA fica só o texto. */
const COLOR_SPAN = /<span data-color="([a-z]+)">([\s\S]*?)<\/span>/g;
/** Fonte do trecho: idem, só o texto. */
const FONT_SPAN = /<span data-font="([a-z0-9-]+)">([\s\S]*?)<\/span>/g;
const PAGE_LINK = /\]\((?:\.\/)?([^/)#\s]+\.md)(#[^)\s]*)?\)/g;

/**
 * O manual num Markdown só, pensado para quem lê com IA: sumário, uma seção por página na ordem da
 * árvore, títulos um nível abaixo do da página, e depois de cada print a legenda e as áreas clicáveis
 * em texto (a IA não vê a imagem, mas lê o que ela aponta).
 */
export function renderMarkdown(collected: Collected, images: Map<string, ImageInfo>): string {
  const { meta, pages } = collected;
  const L = labelsFor(meta.language);
  const anchor = (p: ExportPage) => slugify(`${p.number} ${p.title}`);
  const toc = pages.map((p) => `${"  ".repeat(p.depth)}- [${p.number} ${p.title}](#${anchor(p)})`).join("\n");
  const sections = pages.map((page) => {
    const level = Math.min(page.depth + 2, 6);
    const body = renderBody(page, level, collected, images, {
      link: (target, hash) => `#${hash ? hash.slice(1) : anchor(target)}`,
      image: (asset) => asset,
    });
    return `${"#".repeat(level)} ${page.number} ${page.title}

${body}`;
  });
  return `# ${meta.title}

## ${L.toc}

${toc}

${sections.join("\n\n")}
`;
}

/**
 * Um Markdown por página (`paginas/<slug>.md`, título no nível 1, links entre páginas e imagens relativos
 * a essa pasta) e o `llms.txt` com o título, o resumo de uma linha de cada página e o link para o arquivo.
 */
export function renderMarkdownPages(
  collected: Collected,
  images: Map<string, ImageInfo>,
): { llms: string; pages: { file: string; content: string }[] } {
  const { meta, pages } = collected;
  const files = pageFileNames(pages);
  const fileOf = new Map(pages.map((p, i) => [p, files[i] as string]));
  const out = pages.map((page) => {
    const body = renderBody(page, 2, collected, images, {
      link: (target, hash) => `${fileOf.get(target)}${hash ?? ""}`,
      image: (asset) => `../${asset}`,
    });
    return {
      file: fileOf.get(page) as string,
      content: `# ${page.number} ${page.title}

${body}
`,
    };
  });
  const lines = pages.map((p) => {
    const summary = summaryOf(p.body);
    return `- [${p.number} ${p.title}](paginas/${fileOf.get(p)})${summary ? `: ${summary}` : ""}`;
  });
  return {
    llms: `# ${meta.title}

${lines.join("\n")}
`,
    pages: out,
  };
}

/** Nome de arquivo por página: só `[a-z0-9-]` (não sai da pasta nem vira nome reservado do Windows, pois começa pelo número); repetido ganha `-2`, `-3`. */
function pageFileNames(pages: ExportPage[]): string[] {
  const used = new Set<string>();
  return pages.map((p) => {
    const base = slugify(`${p.number} ${p.title}`) || "pagina";
    let name = base;
    for (let n = 2; used.has(name); n++) name = `${base}-${n}`;
    used.add(name);
    return `${name}.md`;
  });
}

/** Primeira linha de texto corrido da página, sem marcação, até 160 caracteres. */
function summaryOf(body: string): string {
  let fence = false;
  for (const raw of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(raw)) fence = !fence;
    const line = raw.trim();
    if (fence || !line || /^(#|!\[|>|\||---|\*\*\*|<)/.test(line)) continue;
    const text = line
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/^([-*+]|\d+[.)])\s+/, "")
      .replace(/[*_`~=]/g, "")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (text) return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text;
  }
  return "";
}

interface BodyLinks {
  /** Destino de um link para outra página exportada. `hash` vem com `#`. */
  link: (target: ExportPage, hash: string | undefined) => string;
  /** Caminho da imagem (`assets/x.png`) como vai no arquivo. */
  image: (asset: string) => string;
}

/** Corpo de uma página pronto para o Markdown de IA: títulos, só texto nas cores e fontes, links, legendas dos prints. */
function renderBody(
  page: ExportPage,
  level: number,
  collected: Collected,
  images: Map<string, ImageInfo>,
  to: BodyLinks,
): string {
  const { meta, pages, hidden } = collected;
  const hiddenFiles = new Set(hidden.map((h) => h.fileName.toLowerCase()));
  const hiddenIds = new Set(hidden.map((h) => h.id));
  const L = labelsFor(meta.language);
  return shiftHeadings(hiddenFiles.size ? stripHiddenLinks(page.body, hiddenFiles).text : page.body, level)
    .replace(COLOR_SPAN, (all, name: string, text: string) => (Object.hasOwn(TEXT_COLORS, name) ? text : all))
    .replace(FONT_SPAN, (all, id: string, text: string) => (fontById(id) ? text : all))
    .replace(PAGE_LINK, (all, file: string, hash: string | undefined) => {
      const target = pages.find((p) => p.fileName === decodeUri(file));
      return target ? `](${to.link(target, hash)})` : all;
    })
    .split("\n")
    .map((line) => {
      // A legenda vai depois da linha do print, com a mesma indentação (o print pode estar num passo).
      const indent = /^\s*/.exec(line)?.[0] ?? "";
      const notes: string[] = [];
      const out = line.replace(IMAGE_LINE, (all, alt: string, src: string) => {
        const asset = assetFromSrc(src);
        const info = asset ? images.get(asset) : undefined;
        if (!info) return all;
        notes.push(...imageNotes(info, pages, L, hiddenIds));
        return `![${alt}](${to.image(info.asset)})`;
      });
      if (!notes.length) return out;
      return `${out}

${indent}> ${L.legend}:
${notes.map((n) => `${indent}> ${n}`).join("\n")}`;
    })
    .join("\n")
    .trim();
}

/** Legenda e áreas clicáveis do print, em texto, uma por linha. */
function imageNotes(info: ImageInfo, pages: ExportPage[], L: Labels, hiddenIds: Set<string>): string[] {
  const { markers, hotspots } = info.annotations;
  const lines = legendRows(markers)
    .map((r) => `${r.n}. ${r.label}`)
    .concat(
      hotspots
        .filter((h) => h.target.type === "url" || !hiddenIds.has(h.target.pageId))
        .map((h) => {
          if (h.target.type === "url") return L.hotspotUrl(h.target.href);
          const id = h.target.pageId;
          const page = pages.find((p) => p.id === id);
          return L.hotspotPage(page?.title ?? L.removedPage);
        }),
    );
  return lines;
}

/** Põe os títulos da página abaixo do título dela (`level`), sem pular nível. Ignora blocos de código. */
function shiftHeadings(body: string, level: number): string {
  const lines = body.split("\n");
  const found: { at: number; hashes: number }[] = [];
  let fence = false;
  lines.forEach((line, at) => {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const m = fence ? null : /^(#{1,6}) /.exec(line);
    if (m?.[1]) found.push({ at, hashes: m[1].length });
  });
  const levels = exportLevels(
    found.map((f) => f.hashes),
    level,
  );
  found.forEach((f, i) => {
    lines[f.at] = `${"#".repeat(levels[i] ?? 6)} ${(lines[f.at] ?? "").slice(f.hashes + 1)}`;
  });
  return lines.join("\n");
}
