import { parse, stringify } from "yaml";

const FENCE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function splitFrontmatter(text: string): { data: Record<string, unknown>; body: string } {
  const match = FENCE.exec(text);
  if (!match) return { data: {}, body: text };
  const data: unknown = parse(match[1] ?? "");
  if (data !== null && (typeof data !== "object" || Array.isArray(data))) {
    throw new Error("Frontmatter inválido: esperado um mapa YAML.");
  }
  // joinFrontmatter põe uma linha em branco depois do bloco; ela não faz parte do corpo.
  return { data: (data ?? {}) as Record<string, unknown>, body: text.slice(match[0].length).replace(/^\r?\n/, "") };
}

export function joinFrontmatter(data: Record<string, unknown>, body: string): string {
  return `---\n${stringify(data).trimEnd()}\n---\n\n${body.replace(/^\n+/, "")}`;
}
