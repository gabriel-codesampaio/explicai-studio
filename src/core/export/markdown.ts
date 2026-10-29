import { slugify } from "../text.js";
import type { Collected, ExportPage } from "./collect.js";
import { type Labels, labelsFor } from "./labels.js";
import { assetFromSrc, type ImageInfo } from "./refs.js";

const IMAGE_LINE = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
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
    const body = shiftHeadings(page.body, level)
      .replace(PAGE_LINK, (all, file: string, hash: string | undefined) => {
        const target = pages.find((p) => p.fileName === decodeURI(file));
        return target ? `](#${hash ? hash.slice(1) : anchor(target)})` : all;
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
          notes.push(...imageNotes(info, pages, L));
          return `![${alt}](${info.asset})`;
        });
        if (!notes.length) return out;
        return `${out}\n\n${indent}> ${L.legend}:\n${notes.map((n) => `${indent}> ${n}`).join("\n")}`;
      })
      .join("\n");
    return `${"#".repeat(level)} ${page.number} ${page.title}\n\n${body.trim()}`;
  });

  return `# ${meta.title}\n\n## ${L.toc}\n\n${toc}\n\n${sections.join("\n\n")}\n`;
}

/** Legenda e áreas clicáveis do print, em texto, uma por linha. */
function imageNotes(info: ImageInfo, pages: ExportPage[], L: Labels): string[] {
  const { markers, hotspots } = info.annotations;
  const lines = [...markers]
    .sort((a, b) => a.n - b.n)
    .map((m) => `${m.n}. ${m.label ?? L.noDescription}`)
    .concat(
      hotspots.map((h) => {
        if (h.target.type === "url") return L.hotspotUrl(h.target.href);
        const id = h.target.pageId;
        const page = pages.find((p) => p.id === id);
        return L.hotspotPage(page?.title ?? L.removedPage);
      }),
    );
  return lines;
}

/** Desce os títulos da página para ficarem abaixo do título dela (`level`). Ignora blocos de código. */
function shiftHeadings(body: string, level: number): string {
  let fence = false;
  return body
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) fence = !fence;
      if (fence) return line;
      return line.replace(/^(#{1,6}) /, (_, hashes: string) => `${"#".repeat(Math.min(hashes.length + level, 6))} `);
    })
    .join("\n");
}
